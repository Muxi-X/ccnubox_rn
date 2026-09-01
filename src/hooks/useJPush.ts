import { isRunningInExpoGo } from 'expo';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';

import { JPushSecrets } from '@/secret/JPush';
import usePushSubscriptionStore from '@/store/pushSubscription';
import { openBrowser } from '@/utils/handleOpenURL';
import { jpushClient } from '@/utils/jpush';
import { logger } from '@/utils/logger';

type JPushNotificationResult = {
  content?: string;
  extras?: unknown;
  messageID?: string;
  notificationEventType?: 'notificationArrived' | 'notificationOpened';
  title?: string;
};

type NotificationsModule = typeof import('expo-notifications');
type NotificationPermissionsStatus =
  import('expo-notifications').NotificationPermissionsStatus;

let notificationsModulePromise: Promise<NotificationsModule> | null = null;

const getNotificationsModule =
  async (): Promise<NotificationsModule | null> => {
    if (isRunningInExpoGo()) return null;

    notificationsModulePromise ??= import('expo-notifications');
    return notificationsModulePromise;
  };

const normalizeExtras = (extras: unknown): Record<string, string> | null => {
  if (!extras) return null;
  if (typeof extras === 'string') {
    try {
      const parsed = JSON.parse(extras) as Record<string, string>;
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      return null;
    }
  }
  if (typeof extras === 'object') {
    return extras as Record<string, string>;
  }
  return null;
};

const extractUrlFromResult = (
  result: JPushNotificationResult
): string | null => {
  logger.debug('[JPush] 开始解析通知数据', result);
  const extras = normalizeExtras(result.extras);
  logger.debug('[JPush] 解析后的 extras', extras);

  const directUrl = extras?.url;
  if (directUrl) {
    logger.info('[JPush] 从 extras.url 中获取到跳转地址', { directUrl });
    return directUrl;
  }

  const candidates = [
    { name: 'extras.data', value: extras?.data },
    { name: 'extras.payload', value: extras?.payload },
    { name: 'content', value: result.content },
  ];

  for (const { name, value } of candidates) {
    if (!value || typeof value !== 'string') continue;
    try {
      logger.debug(`[JPush] 尝试解析候选字段 ${name}`, { value });
      const parsed = JSON.parse(value) as { url?: string };
      if (parsed?.url) {
        logger.info(`[JPush] 从 ${name} 解析成功，跳转地址:`, parsed.url);
        return parsed.url;
      }
    } catch {
      // ignore parse errors
    }
  }
  logger.warn('[JPush] 未能从通知中提取到有效的跳转地址');
  return null;
};

type PushUrlResolver = (pathOrUrl: string) => void;

type NativeJPushColdStartBridgeModule = {
  consumeInitialNotificationOpened?: () => Promise<Record<
    string,
    unknown
  > | null>;
};

const consumeNativeInitialJPushOpened = async (stage: string) => {
  if (Platform.OS !== 'ios') return null;

  const nativeBridge = (
    NativeModules as { JPushColdStartBridge?: NativeJPushColdStartBridgeModule }
  ).JPushColdStartBridge;

  if (typeof nativeBridge?.consumeInitialNotificationOpened !== 'function') {
    logger.warn('[JPush] JPushColdStartBridge 不存在，无法读取冷启动点击消息');
    return null;
  }

  try {
    const payload = await nativeBridge.consumeInitialNotificationOpened();
    logger.debug(`[JPush] 读取桥接冷启动点击消息 (${stage})`, payload);
    return payload;
  } catch (error) {
    logger.error('[JPush] 读取桥接冷启动点击消息失败', error);
    return null;
  }
};

let pendingPushPath: string | null = null;
let pushNavigationReady = false;
let listenersRegistered = false;
let initializationPromise: Promise<boolean> | null = null;

export const setPushNavigationReady = (ready: boolean) => {
  pushNavigationReady = ready;
  if (ready) {
    flushPendingPushNavigation();
  }
};

export const flushPendingPushNavigation = () => {
  if (!pushNavigationReady || !pendingPushPath) return;
  const path = pendingPushPath;
  pendingPushPath = null;
  logger.info('[JPush] 执行延迟推送跳转', { path });
  router.push(path as any);
};

const queuePushNavigation = (path: string) => {
  pendingPushPath = path;
  logger.info('[JPush] 缓存推送跳转路径', {
    path,
    pushNavigationReady,
  });
  if (pushNavigationReady) {
    flushPendingPushNavigation();
  }
};

const ccnuboxResolver: PushUrlResolver = pathOrUrl => {
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  queuePushNavigation(path);
};

const createHttpResolver = (scheme: 'http' | 'https'): PushUrlResolver => {
  return pathOrUrl => {
    openBrowser(`${scheme}://${pathOrUrl}`);
  };
};

const pushUrlResolvers: Record<string, PushUrlResolver> = {
  ccnubox: ccnuboxResolver,
  http: createHttpResolver('http'),
  https: createHttpResolver('https'),
};

const convertRawApnsUserInfoToJPushOpenedResult = (
  userInfo: Record<string, unknown>
): JPushNotificationResult => {
  const aps = userInfo.aps as { alert?: unknown } | undefined;
  const alert = aps?.alert;

  let title = '';
  let content = '';
  if (typeof alert === 'string') {
    content = alert;
  } else if (alert && typeof alert === 'object') {
    const alertObj = alert as { title?: unknown; body?: unknown };
    if (typeof alertObj.title === 'string') title = alertObj.title;
    if (typeof alertObj.body === 'string') content = alertObj.body;
  }

  const extras: Record<string, string> = {};
  for (const [key, value] of Object.entries(userInfo)) {
    if (['aps', '_j_msgid', '_j_uid', '_j_business'].includes(key)) continue;
    if (typeof value === 'string') {
      extras[key] = value;
      continue;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      extras[key] = String(value);
      continue;
    }
    if (value && typeof value === 'object') {
      try {
        extras[key] = JSON.stringify(value);
      } catch {
        // ignore non-serializable values
      }
    }
  }

  return {
    content,
    extras: Object.keys(extras).length ? extras : undefined,
    messageID:
      typeof userInfo._j_msgid === 'string'
        ? userInfo._j_msgid
        : typeof userInfo._j_msgid === 'number'
          ? String(userInfo._j_msgid)
          : undefined,
    notificationEventType: 'notificationOpened',
    title,
  };
};

const handleConnectEvent = (result: { connectEnable?: boolean }) => {
  logger.info(`[${Platform.OS}] JPush 连接状态变化`, result);
  const isConnected = result.connectEnable ?? false;

  if (isConnected) {
    logger.info('JPush 连接成功', result);
  } else {
    logger.warn('JPush 连接失败');
  }
};

const handleNotificationEvent = (result: unknown) => {
  const payload = result as JPushNotificationResult;
  logger.debug('[JPush] 监听到通知事件', {
    type: payload.notificationEventType,
    payload,
  });

  if (payload.notificationEventType !== 'notificationOpened') return;

  logger.info('[JPush] 用户点击了通知');
  const url = extractUrlFromResult(payload);
  if (url) {
    openPushUrl(url);
  } else {
    logger.info('[JPush] 通知被打开，但未找到跳转 URL');
  }
};

const handleCustomMessage = (result: unknown) => {
  logger.debug('收到自定义消息', result);
};

const hasGrantedPushPermission = (
  settings: NotificationPermissionsStatus,
  Notifications: NotificationsModule
) => {
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};

export const ensurePushPermission = async (requestIfNeeded = false) => {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const currentSettings = await Notifications.getPermissionsAsync();
  const isProvisionallyAuthorized =
    currentSettings.ios?.status ===
    Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (
    hasGrantedPushPermission(currentSettings, Notifications) &&
    (!requestIfNeeded || !isProvisionallyAuthorized)
  ) {
    return true;
  }

  if (!requestIfNeeded) {
    return false;
  }

  const requestedSettings = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowProvisional: false,
      allowSound: true,
    },
  });
  return (
    hasGrantedPushPermission(requestedSettings, Notifications) &&
    requestedSettings.ios?.status !==
      Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};

const registerJPushListeners = async () => {
  if (listenersRegistered) return;

  jpushClient.removeListener(handleConnectEvent);
  jpushClient.removeListener(handleNotificationEvent);
  jpushClient.removeListener(handleCustomMessage);
  jpushClient.addConnectEventListener(handleConnectEvent);
  jpushClient.addNotificationListener(handleNotificationEvent);
  jpushClient.addCustomMessageListener(handleCustomMessage);

  const bridgedBeforeInit =
    await consumeNativeInitialJPushOpened('before-init');
  if (bridgedBeforeInit) {
    handleNotificationEvent(
      convertRawApnsUserInfoToJPushOpenedResult(bridgedBeforeInit)
    );
  }

  listenersRegistered = true;
};

export const initializeJPush = async ({
  requestPermission = false,
}: {
  requestPermission?: boolean;
} = {}) => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      if (!jpushClient.isAvailable()) {
        logger.warn('[JPush] 原生模块不存在，跳过初始化');
        return false;
      }

      const Notifications = await getNotificationsModule();
      if (!Notifications) return false;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('tips', {
          name: '消息通知',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const permissionGranted = await ensurePushPermission(requestPermission);
      if (!permissionGranted) {
        logger.warn('[JPush] 未获得通知权限，跳过初始化');
        return false;
      }

      await registerJPushListeners();

      if (!jpushClient.isInitialized()) {
        jpushClient.setLoggerEnable(__DEV__);
        const initSucceeded = jpushClient.init({
          appKey: JPushSecrets.appKey,
          channel: JPushSecrets.channel,
          production: process.env.EXPO_PUBLIC_ENV === 'production',
        });
        if (!initSucceeded) {
          return false;
        }
        jpushClient.markInitialized(true);

        const bridgedAfterInit =
          await consumeNativeInitialJPushOpened('after-init');
        if (bridgedAfterInit) {
          handleNotificationEvent(
            convertRawApnsUserInfoToJPushOpenedResult(bridgedAfterInit)
          );
        }

        jpushClient.getRegistrationID((result: { registerID?: string }) => {
          if (result.registerID) {
            logger.info('JPush Registration ID', {
              registerID: result.registerID,
            });
          }
        });
      }

      logger.info('JPush 初始化完成');
      return true;
    } catch (error) {
      logger.error('JPush 初始化失败', error);
      return false;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

export const openPushUrl = (url: string) => {
  logger.info('[JPush] 尝试打开跳转地址', { url });
  const trimmed = url.trim();
  const schemeMatch = trimmed.match(/^([a-z][a-z0-9+.-]*):\/\//i);
  const scheme = schemeMatch?.[1]?.toLowerCase();

  if (!scheme) {
    logger.warn('[JPush] 无法识别的跳转协议 (no scheme)', { url });
    if (trimmed.startsWith('/')) {
      logger.info('[JPush] 识别为路径，尝试使用 ccnubox 协议处理', {
        path: trimmed,
      });
      ccnuboxResolver(trimmed);
    }
    return;
  }

  const resolver = pushUrlResolvers[scheme];
  if (!resolver) {
    logger.warn('[JPush] 不支持的协议类型', { scheme, url });
    return;
  }

  const pathOrUrl = trimmed.replace(/^([a-z][a-z0-9+.-]*):\/\//i, '');
  logger.debug(`[JPush] 使用 ${scheme} 解析器处理路径`, { pathOrUrl });
  resolver(pathOrUrl);
};

const useJPush = () => {
  const enabled = usePushSubscriptionStore(state => state.enabled);

  useEffect(() => {
    if (!enabled) return;
    initializeJPush().catch(error => {
      logger.error('JPush 自动初始化失败', error);
    });
  }, [enabled]);
};

export default useJPush;
