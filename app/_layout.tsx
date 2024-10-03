import { Toast, Provider } from '@ant-design/react-native';
import { loadAsync } from 'expo-font';
import { Stack } from 'expo-router';
import React, { RefObject, useCallback, useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';

import Scraper from '@/components/scraper';
import useScraper from '@/store/scraper';
import useVisualScheme from '@/store/visualScheme';
import fetchUpdates from '@/utils/fetchUpdates';

export default function RootLayout() {
  const initStyles = useVisualScheme(state => state.initStyles);
  const scraperRef = useRef<WebView>();
  const { ref, setRef } = useScraper(({ ref, setRef }) => ({ ref, setRef }));
  const handleMessage = useCallback(() => {}, []);
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
    // 设置 ref
    setRef(scraperRef as RefObject<WebView<{}> | null>);
  }, [initStyles]);
  return (
    /** 没有 Provider，Toast 和 Modal 会失效，误删 */
    <Provider>
      {/* 手势检测 */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Scraper
          ref={ref as RefObject<WebView<{}> | null>}
          onMessage={handleMessage}
        ></Scraper>
        <Stack>
          <Stack.Screen
            name="auth"
            options={{ headerShown: false }}
          ></Stack.Screen>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </Provider>
  );
}
