import { router, SplashScreen } from 'expo-router';
import { getItem, setItem } from 'expo-secure-store';
import * as React from 'react';

import useCourse from '@/store/course';

import { setupGlobalErrorHandler } from '@/utils/errorHandler';

const Index = () => {
  const hydrated = useCourse(state => state.hydrated);
  const initialized = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated || initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        const firstLaunch = await getItem('firstLaunch');
        const token = await getItem('longToken');

        setupGlobalErrorHandler();
        await SplashScreen.hideAsync();

        if (!token) {
          if (firstLaunch === null) {
            setItem('firstLaunch', 'false');
            console.log('首次启动，跳转到引导页');
            router.replace('/auth/guide');
          } else {
            router.replace('/auth/login');
          }
        } else {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };

    init();
  }, [hydrated]);

  return null;
};
export default Index;
