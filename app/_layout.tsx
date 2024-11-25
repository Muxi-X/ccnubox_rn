import { Provider, Toast } from '@ant-design/react-native';
import { loadAsync } from 'expo-font';
import { Stack } from 'expo-router';
import React, { RefObject, useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';

import { useJPush } from '@/hooks';

import PortalRoot from '@/components/portal';
import Scraper from '@/components/scraper';

import { usePortalStore } from '@/store/portal';
import useScraper from '@/store/scraper';
import useVisualScheme from '@/store/visualScheme';

import fetchUpdates from '@/utils/fetchUpdates';

export default function RootLayout() {
  const initVisualScheme = useVisualScheme(state => state.init);
  const scraperRef = useRef<WebView>();
  const portalRef = useRef<View>();
  const { ref, setRef } = useScraper(({ ref, setRef }) => ({ ref, setRef }));
  // 爬虫回调
  const handleMessage = useCallback((data: string) => {
    alert(data);
  }, []);
  const setPortalRef = usePortalStore(state => state.setPortalRef);
  // 配置JPush,消息推送
  try {
    useJPush();
  } catch (err) {
    alert(JSON.stringify(err));
  }
  useEffect(() => {
    // 引入所有样式以及基于 theme 的组件
    initVisualScheme();
    // 加载字体
    void loadAsync({
      antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
    });
    // 配置Toast
    Toast.config({ mask: false, stackable: true });
    // 获取更新
    fetchUpdates().then(null, null);
    // 在 store 中设置爬虫 ref
    setRef(scraperRef);
    // 在 store 中配置 portal ref
    setPortalRef(portalRef);
  }, [initVisualScheme]);
  return (
    <>
      {/* Provider 中带有 Portal，没有 Provider，Toast 和 Modal 会失效，误删  */}
      {/* FIX_ME 自建 portal 组件，支持自定义 Toast Modal */}
      <Provider>
        {/* 手势检测 */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Scraper
            ref={ref as RefObject<WebView<{}> | null>}
            onMessage={handleMessage}
          ></Scraper>
          <Stack
            screenOptions={{
              contentStyle:
                useVisualScheme.getState().currentStyle?.background_style,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth"
              options={{ headerShown: false }}
            ></Stack.Screen>
            <Stack.Screen
              name="(mainPage)"
              options={{ headerShown: false }}
            ></Stack.Screen>
          </Stack>
          {/* portal */}
          <PortalRoot ref={portalRef} />
        </GestureHandlerRootView>
      </Provider>
    </>
  );
}
