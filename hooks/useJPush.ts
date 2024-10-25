import * as Notifications from 'expo-notifications';
import { setItem } from 'expo-secure-store';
import JPush from 'jpush-react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { JPushSecrets } from '@/secret/JPush';

export const useJPush = () => {
  useEffect(() => {
    if (__DEV__) {
      alert('开发环境，禁用notification');
      return;
    }
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('course_box', {
        name: '华师匣子',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
        .then(getPermission)
        .then(initJPush);
    }
  }, []);
};
/**
 * 获取通知权限
 */
const getPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('消息推送失败');
    return;
  }
  return finalStatus;
};
/**
 * 初始化极光推送
 */
const initJPush = () => {
  const { appKey, channel } = JPushSecrets;
  JPush.setLoggerEnable(true);
  JPush.init({
    appKey,
    channel,
    //@ts-expect-error 这里为 sdk 类型注释问题，可忽略
    production: 1,
  });
  //连接状态
  console.log('init');
  const connectListener = (result: any) => {
    console.log('connectListener:' + JSON.stringify(result));
    // 获取registerID
    JPush.getRegistrationID(result => {
      console.log('registerID:' + JSON.stringify(result));
      setItem('pushToken', result.registerID);
    });
  };
  JPush.addConnectEventListener(connectListener);
  //通知回调
  const notificationListener = (result: any) => {
    alert('notificationListener:' + JSON.stringify(result));
    alert(JSON.stringify(result));
  };
  JPush.addNotificationListener(notificationListener);
  //本地通知回调
  const localNotificationListener = (result: any) => {
    alert('localNotificationListener:' + JSON.stringify(result));
  };
  JPush.addLocalNotificationListener(localNotificationListener);
  //自定义消息回调
  const customMessageListener = (result: any) => {
    alert('customMessageListener:' + JSON.stringify(result));
  };
  JPush.addCustomMessageListener(customMessageListener);
  //应用内消息回调
  JPush.pageEnterTo('HomePage'); // 进入首页，当页面退出时请调用 JPush.pageLeave('HomePage')
  const inappMessageListener = (result: any) => {
    alert('inappMessageListener:' + JSON.stringify(result));
    alert(JSON.stringify(result));
  };
  JPush.addInappMessageListener(inappMessageListener);
  //tag alias事件回调
  const tagAliasListener = (result: any) => {
    console.log('tagAliasListener:' + JSON.stringify(result));
  };
  JPush.addTagAliasListener(tagAliasListener);
  //手机号码事件回调
  const mobileNumberListener = (result: any) => {
    console.log('mobileNumberListener:' + JSON.stringify(result));
  };
  JPush.addMobileNumberListener(mobileNumberListener);
};
