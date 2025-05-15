import { Provider, Toast } from '@ant-design/react-native';
import { loadAsync } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';

import { useJPush } from '@/hooks';

import PortalRoot from '@/components/portal';
import Scraper from '@/components/scraper';

import { usePortalStore } from '@/store/portal';
import useScraper from '@/store/scraper';
import useVisualScheme from '@/store/visualScheme';

import { commonColors } from '@/styles/common';
import { fetchUpdate } from '@/utils';

export default function RootLayout() {
  const initVisualScheme = useVisualScheme(state => state.init);
  const scraperRef = React.useRef<WebView>();
  const portalRef = React.useRef<View>();
  const { ref, setRef } = useScraper(({ ref, setRef }) => ({ ref, setRef }));

  // 爬虫回调
  const handleMessage = React.useCallback((data: string) => {
    alert(data);
  }, []);

  const setPortalRef = usePortalStore(state => state.setPortalRef);

  // 配置JPush,消息推送
  try {
    useJPush();
  } catch (err) {
    alert(JSON.stringify(err));
    console.error('JPush init failed:', err);
  }

  const initApp = React.useCallback(async () => {
    // 引入所有样式以及基于 theme 的组件
    initVisualScheme();
    // 加载字体
    void loadAsync({
      antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
    });
    // 配置Toast
    Toast.config({ mask: false, stackable: true });
    // 获取更新
    fetchUpdate();
    // 在 store 中设置爬虫 ref
    setRef(scraperRef);
    // 在 store 中配置 portal ref
    setPortalRef(portalRef);
  }, [initVisualScheme]);

  React.useEffect(() => {
    initApp();
  }, []);

  return (
    <>
      {/* Provider 中带有 Portal，没有 Provider，Toast 和 Modal 会失效，误删  */}
      {/* FIX_ME 自建 portal 组件，支持自定义 Toast Modal */}
      <Provider
        theme={{
          brand_primary: commonColors.purple,
        }}
        onHaptics={() =>
          Platform.OS !== 'web' &&
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
      >
        {/* 手势检测 */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Scraper
            ref={ref as React.RefObject<WebView<{}> | null>}
            onMessage={handleMessage}
          ></Scraper>
          <Stack
            screenOptions={{
              headerBackVisible: false,
              headerShown: false,
              animation: 'ios',
            }}
          >
            {['(tabs)', '(courseTable)', 'auth', '(mainPage)', '(setting)'].map(
              name => (
                <Stack.Screen
                  key={name}
                  name={name}
                  options={{ headerShown: false }}
                />
              )
            )}
          </Stack>
          {/* portal */}
          <PortalRoot ref={portalRef} />
        </GestureHandlerRootView>
      </Provider>
    </>
  );
}
