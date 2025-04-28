import { Href, Redirect, SplashScreen } from 'expo-router';
import { getItem, setItem } from 'expo-secure-store';
import { useEffect, useState } from 'react';

import useCourse from '@/store/course';

import { setupMockServer } from '@/mock/server';

// 由于 expo 没有 initialRoutes
// 重定向到 tabs
// 详情见 issue: https://github.com/expo/router/issues/763#issuecomment-1635316964
const Index = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const hydrated = useCourse(state => state.hydrated);

  useEffect(() => {
    if (__DEV__) {
      //console.log('mock server setup');
      setupMockServer();
    }

    const init = async () => {
      const firstLaunch = getItem('firstLaunch');
      const token = getItem('longToken');

      if (hydrated) await SplashScreen.hideAsync();
      if (!token) {
        if (firstLaunch === null) {
          // 是首次启动，设置标记并跳转到guide
          setItem('firstLaunch', 'false');
          setInitialRoute('/auth/guide');
        } else {
          // 不是首次启动但没有token，去登录
          setInitialRoute('/auth/login');
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
  return <Redirect href={initialRoute as Href} />;
};
export default Index;
