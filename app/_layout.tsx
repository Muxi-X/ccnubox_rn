import { Toast, Provider } from '@ant-design/react-native';
import { loadAsync } from 'expo-font';
import { Stack } from 'expo-router';
import React, { RefObject, useCallback, useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';

import Scraper from '@/components/scraper';
import { useJPush } from '@/hooks/useJPush';
import useScraper from '@/store/scraper';
import useVisualScheme from '@/store/visualScheme';
import fetchUpdates from '@/utils/fetchUpdates';

export default function RootLayout() {
  const initStyles = useVisualScheme(state => state.initStyles);
  const scraperRef = useRef<WebView>();
  const { ref, setRef } = useScraper(({ ref, setRef }) => ({ ref, setRef }));
  const handleMessage = useCallback((data: string) => {
    alert(data);
  }, []);
  // 配置JPush,消息推送
  try {
    useJPush();
  } catch (err) {
    alert(JSON.stringify(err));
  }
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
    // 在 store 中设置爬虫 ref
    setRef(scraperRef);
  }, [initStyles]);
  return (
    /** Provider 中带有 Portal，没有 Provider，Toast 和 Modal 会失效，误删 */
    // @fix-me 自建 portal 组件，支持自定义 Toast Modal
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
