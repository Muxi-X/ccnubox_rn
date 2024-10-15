import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
/**
 * 消息通知
 * @deprecated 国内安卓 fcm 用不了，此 hook 目前只能用于个性化定制
 * @param behavior 通知选项
 * @example {
 *  shouldPlaySound: true, // 是否播放声音
    shouldSetBadge: true, // 是否在应用上显示未读消息小红点
    shouldShowAlert: true, // 是否显示通知
 * }
 * @param notificationConfig 通知注册选项
 * @example {
    content: {
      title: '测试消息111 📬',
      body: '不知道不知道不知道',
      data: { data: '123435' },
    },
    trigger: { date: new Date(2024, 6, 21, 12, 12) }, // 触发时间，可以填interval、date，不填立刻触发
  }
    @returns [ notificationInfo, registerNotification ]
 */
export default function useNotification(
  behavior: Notifications.NotificationBehavior = {
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
  },
  notificationConfig: Notifications.NotificationRequestInput = {
    content: {
      title: '测试消息111 📬',
      body: '不知道不知道不知道',
      data: { data: '123435' },
    },
    trigger: {
      seconds: 5, // Trigger the notification in 24 hours
    },
  }
) {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => behavior,
    });
    registerForPushNotificationsAsync().then(
      token => token && setExpoPushToken(token)
    );

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value =>
        setChannels(value ?? [])
      );
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  const registerNotification = async (
    notification: Notifications.NotificationRequestInput = notificationConfig
  ) => {
    await Notifications.scheduleNotificationAsync(notification);
  };
  return [{ expoPushToken, channels, notification }, registerNotification] as [
    {
      expoPushToken: string;
      channels: typeof channels;
      notification: typeof notification;
    },
    typeof registerNotification
  ];
}

/**
 * @deprecated 国内安卓 fcm 用不了，此 hook 目前只能用于个性化定制
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('course_box', {
      name: '华师匣子',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('消息推送失败');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
