import { Toast, Provider } from '@ant-design/react-native';
import { loadAsync } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import useVisualScheme from '@/store/visualScheme';
import fetchUpdates from '@/utils/fetchUpdates';

export default function RootLayout() {
  const initStyles = useVisualScheme(state => state.initStyles);
  useEffect(() => {
    // 引入所有样式
    initStyles();
    // 加载字体
    loadAsync({
      antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
    }).then(() => {
      console.log('icon loaded');
    });
    // 配置Toast
    Toast.config({ mask: false, stackable: true });
    // 获取更新
    fetchUpdates().then(null, null);
  }, []);
  return (
    /** 没有 Provider，Toast 和 Modal 会失效，误删 */
    <Provider>
      <Stack>
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}
