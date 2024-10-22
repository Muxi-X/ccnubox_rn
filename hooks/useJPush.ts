import { setItem } from 'expo-secure-store';
import JPush from 'jpush-react-native';
import { useEffect } from 'react';

export const useJPush = () => {
  useEffect(() => {
    if (__DEV__) {
      alert('开发环境，禁用notification');
      return;
    }
    JPush.setLoggerEnable(true);
    JPush.init({
      appKey: '3fdd1ecdd0325fa2a197df7e',
      channel: 'course_box',
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
      console.log('notificationListener:' + JSON.stringify(result));
      alert(JSON.stringify(result));
    };
    JPush.addNotificationListener(notificationListener);
    //本地通知回调
    const localNotificationListener = (result: any) => {
      console.log('localNotificationListener:' + JSON.stringify(result));
    };
    JPush.addLocalNotificationListener(localNotificationListener);
    //自定义消息回调
    const customMessageListener = (result: any) => {
      console.log('customMessageListener:' + JSON.stringify(result));
    };
    JPush.addCustomMessageListener(customMessageListener);
    //应用内消息回调
    JPush.pageEnterTo('HomePage'); // 进入首页，当页面退出时请调用 JPush.pageLeave('HomePage')
    const inappMessageListener = (result: any) => {
      console.log('inappMessageListener:' + JSON.stringify(result));
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
  }, []);
};
