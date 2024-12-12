import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { setupMockServer } from '@/mock/server';

// 由于 expo 没有 initialRoutes
// 重定向到 tabs
// 详情见 issue: https://github.com/expo/router/issues/763#issuecomment-1635316964
const Index = () => {
  useEffect(() => {
    if (__DEV__) {
      console.log('mock server setup');
      setupMockServer();
    }
  });

  return <Redirect href="/(tabs)"></Redirect>;
};
export default Index;
