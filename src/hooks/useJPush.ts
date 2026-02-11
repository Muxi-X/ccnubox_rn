import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import JPush from 'jpush-react-native';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { JPushSecrets } from '@/secret/JPush';
import { openBrowser } from '@/utils/handleOpenURL';

type JPushNotificationResult = {
  content?: string;
  extras?: unknown;
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

const ccnuboxResolver: PushUrlResolver = pathOrUrl => {
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  router.push(path as any);
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

    const init = async () => {
      try {
        // Android 设置通知渠道
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('coursebox', {
            name: '华师匣子',
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

        // 初始化 JPush
        JPush.setLoggerEnable(__DEV__);

        JPush.init({
          appKey: JPushSecrets.appKey,
          channel: JPushSecrets.channel,
          production: Boolean(__DEV__ ? 0 : 1),
        });

        // 获取并保存 Registration ID
        JPush.getRegistrationID((result: { registerID?: string }) => {
          const id = result.registerID;
          if (id) {
            console.log('✅ JPush Registration ID:', id);
          }
        });

        JPush.addConnectEventListener(result => {
          console.log(`[${Platform.OS}] JPush 连接状态变化:`, result);
          const isConnected = result.connectEnable ?? false;

          if (isConnected) {
            console.log(`✅ JPush 连接成功`, result);
          } else {
            console.warn(`⚠️ JPush 连接失败`);
          }
        });

        // 添加监听器
        JPush.addNotificationListener((result: unknown) => {
          const payload = result as JPushNotificationResult;
          console.log(
            '[JPush] 监听到通知事件:',
            payload.notificationEventType,
            payload
          );
          if (payload.notificationEventType === 'notificationOpened') {
            console.log('[JPush] 用户点击了通知');
            const url = extractUrlFromResult(payload);
            if (url) {
              openPushUrl(url);
            } else {
              console.log('[JPush] 通知被打开，但未找到跳转 URL');
            }
          }
        });

        JPush.addCustomMessageListener((result: unknown) => {
          console.log('收到自定义消息:', result);
        });

        isInitializedRef.current = true;
        console.log('✅ JPush 初始化完成');
      } catch (error) {
        console.error('JPush 初始化失败:', error);
      }
    };
    init();
  }, []);
};

export default useJPush;
