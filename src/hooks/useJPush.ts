import * as Notifications from 'expo-notifications';
import JPush from 'jpush-react-native';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { JPushSecrets } from '@/secret/JPush';

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
          console.log('收到通知:', result);
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
