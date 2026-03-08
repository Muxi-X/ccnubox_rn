import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import JPush from 'jpush-react-native';
import { useEffect, useRef } from 'react';
import { NativeModules, Platform } from 'react-native';

import { JPushSecrets } from '@/secret/JPush';
import { openBrowser } from '@/utils/handleOpenURL';

type JPushNotificationResult = {
  content?: string;
  extras?: unknown;
  messageID?: string;
  notificationEventType?: 'notificationArrived' | 'notificationOpened';
  title?: string;
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
  console.log('[JPush] 开始解析通知数据:', JSON.stringify(result, null, 2));
  const extras = normalizeExtras(result.extras);
  console.log('[JPush] 解析后的 extras:', extras);

  const directUrl = extras?.url;
  if (directUrl) {
    console.log('[JPush] 从 extras.url 中获取到跳转地址:', directUrl);
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
      console.log(`[JPush] 尝试解析候选字段 ${name}:`, value);
      const parsed = JSON.parse(value) as { url?: string };
      if (parsed?.url) {
        console.log(`[JPush] 从 ${name} 解析成功，跳转地址:`, parsed.url);
        return parsed.url;
      }
    } catch {
      // ignore parse errors
    }
  }
  console.warn('[JPush] 未能从通知中提取到有效的跳转地址');
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
    console.warn('[JPush] JPushColdStartBridge 不存在，无法读取冷启动点击消息');
    return null;
  }

  try {
    const payload = await nativeBridge.consumeInitialNotificationOpened();
    console.log(
      `[JPush] 读取桥接冷启动点击消息 (${stage}):`,
      payload ? JSON.stringify(payload) : 'null'
    );
    return payload;
  } catch (error) {
    console.error('[JPush] 读取桥接冷启动点击消息失败:', error);
    return null;
  }
};

let pendingPushPath: string | null = null;
let pushNavigationReady = false;

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
  console.log('[JPush] 执行延迟推送跳转:', path);
  router.push(path as any);
};

const queuePushNavigation = (path: string) => {
  pendingPushPath = path;
  console.log(
    '[JPush] 缓存推送跳转路径:',
    path,
    '导航就绪:',
    pushNavigationReady
  );
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

export const openPushUrl = (url: string) => {
  console.log('[JPush] 尝试打开跳转地址:', url);
  const trimmed = url.trim();
  const schemeMatch = trimmed.match(/^([a-z][a-z0-9+.-]*):\/\//i);
  const scheme = schemeMatch?.[1]?.toLowerCase();

  if (!scheme) {
    console.warn('[JPush] 无法识别的跳转协议 (no scheme):', url);
    // 默认尝试作为 ccnubox 路径处理
    if (trimmed.startsWith('/')) {
      console.log('[JPush] 识别为路径，尝试使用 ccnubox 协议处理:', trimmed);
      ccnuboxResolver(trimmed);
    }
    return;
  }

  const resolver = pushUrlResolvers[scheme];
  if (!resolver) {
    console.warn('[JPush] 不支持的协议类型:', scheme, '完整地址:', url);
    return;
  }

  const pathOrUrl = trimmed.replace(/^([a-z][a-z0-9+.-]*):\/\//i, '');
  console.log(`[JPush] 使用 ${scheme} 解析器处理路径:`, pathOrUrl);
  resolver(pathOrUrl);
};

const useJPush = () => {
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;

    let disposed = false;

    const handleConnectEvent = (result: { connectEnable?: boolean }) => {
      console.log(`[${Platform.OS}] JPush 连接状态变化:`, result);
      const isConnected = result.connectEnable ?? false;

      if (isConnected) {
        console.log(`✅ JPush 连接成功`, result);
      } else {
        console.warn(`⚠️ JPush 连接失败`);
      }
    };

    const handleNotificationEvent = (result: unknown) => {
      const payload = result as JPushNotificationResult;
      console.log(
        '[JPush] 监听到通知事件:',
        payload.notificationEventType,
        payload
      );

      if (payload.notificationEventType !== 'notificationOpened') return;

      console.log('[JPush] 用户点击了通知');
      const url = extractUrlFromResult(payload);
      if (url) {
        openPushUrl(url);
      } else {
        console.log('[JPush] 通知被打开，但未找到跳转 URL');
      }
    };

    const handleCustomMessage = (result: unknown) => {
      console.log('收到自定义消息:', result);
    };

    const init = async () => {
      try {
        // Android 设置通知渠道
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('tips', {
            name: '消息通知',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        // 请求通知权限
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('未获得通知权限');
          return;
        }
        if (disposed) return;

        // 初始化 JPush
        JPush.setLoggerEnable(__DEV__);

        // 先注册监听器，再 init（避免 iOS 点击事件在 init 时机过早下发）
        JPush.removeListener(handleConnectEvent);
        JPush.removeListener(handleNotificationEvent);
        JPush.removeListener(handleCustomMessage);
        JPush.addConnectEventListener(handleConnectEvent);
        JPush.addNotificationListener(handleNotificationEvent);
        JPush.addCustomMessageListener(handleCustomMessage);
        const bridgedBeforeInit =
          await consumeNativeInitialJPushOpened('before-init');
        if (bridgedBeforeInit) {
          handleNotificationEvent(
            convertRawApnsUserInfoToJPushOpenedResult(bridgedBeforeInit)
          );
        }

        JPush.init({
          appKey: JPushSecrets.appKey,
          channel: JPushSecrets.channel,
          production: Boolean(__DEV__ ? 0 : 1),
        });
        const bridgedAfterInit =
          await consumeNativeInitialJPushOpened('after-init');
        if (bridgedAfterInit) {
          handleNotificationEvent(
            convertRawApnsUserInfoToJPushOpenedResult(bridgedAfterInit)
          );
        }

        // 获取并保存 Registration ID
        JPush.getRegistrationID((result: { registerID?: string }) => {
          const id = result.registerID;
          if (id) {
            console.log('✅ JPush Registration ID:', id);
          }
        });

        isInitializedRef.current = true;
        console.log('✅ JPush 初始化完成');
      } catch (error) {
        console.error('JPush 初始化失败:', error);
      }
    };
    init();

    return () => {
      disposed = true;
      JPush.removeListener(handleConnectEvent);
      JPush.removeListener(handleNotificationEvent);
      JPush.removeListener(handleCustomMessage);
    };
  }, []);
};

export default useJPush;
