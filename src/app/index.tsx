import { Href, Redirect, SplashScreen } from 'expo-router';
import { getItem, setItem } from 'expo-secure-store';
import * as React from 'react';
import { Platform } from 'react-native';

import useCourse from '@/store/course';

import { setupGlobalErrorHandler } from '@/utils/errorHandler';
import { updateCourseData } from '@/utils/updateWidget';

// 由于 expo 没有 initialRoutes
// 重定向到 tabs
// 详情见 issue: https://github.com/expo/router/issues/763#issuecomment-1635316964
const Index = () => {
  const [initialRoute, setInitialRoute] = React.useState<string | null>(null);
  const hydrated = useCourse(state => state.hydrated);

  React.useEffect(() => {
    // if (__DEV__) {
    //   //console.log('mock server setup');
    //   setupMockServer();
    // }

    const init = async () => {
      const firstLaunch = await getItem('firstLaunch');

      const token = await getItem('longToken');

      // 设置全局错误处理器
      setupGlobalErrorHandler();
      // 等待 AsyncStorage 加载
      if (hydrated) await SplashScreen.hideAsync();
      if (!token) {
        if (firstLaunch === null) {
          // 是首次启动，设置标记并跳转到guide
          setItem('firstLaunch', 'false');
          setInitialRoute('/auth/guide');
        } else {
          if (Platform.OS === 'android') {
            updateCourseData()
              .then(() => {
                console.log('updateWidget');
              })
              .catch(error => {
                console.error('更新小组件失败:', error);
              });
          }

          // 不是首次启动但没有token，去登录
          setInitialRoute('/auth/guide');
        }
      } else {
        // 有token直接进入主页
        setInitialRoute('/(tabs)');
      }
    };

    SplashScreen.preventAutoHideAsync();
    init();
  }, [hydrated]);

  if (!initialRoute) {
    return null;
  }

  return <Redirect href={initialRoute as Href}></Redirect>;
};
export default Index;
