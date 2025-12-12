import { Provider, Toast } from '@ant-design/react-native';
import { loadAsync } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import * as React from 'react';
import { Appearance, Platform, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import useJPush from '@/hooks/useJPush';

import PortalRoot from '@/components/portal';
import Scraper from '@/components/scraper';

import { usePortalStore } from '@/store/portal';
import useScraper from '@/store/scraper';
import useVisualScheme from '@/store/visualScheme';

import { commonColors } from '@/styles/common';
import { fetchUpdate } from '@/utils';

export default function RootLayout() {
  const initVisualScheme = useVisualScheme(state => state.init);
  const changeTheme = useVisualScheme(state => state.changeTheme);
  const isAutoTheme = useVisualScheme(state => state.isAutoTheme);
  const scraperRef = React.useRef<WebView>(null);
  const portalRef = React.useRef<View>(null);
  const { ref, setRef } = useScraper(({ ref, setRef }) => ({ ref, setRef }));

  // 爬虫回调
  const handleMessage = React.useCallback((data: string) => {
    alert(data);
  }, []);

  const setPortalRef = usePortalStore(state => state.setPortalRef);

  // 配置 JPush 消息推送
  useJPush();

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
    if (!__DEV__) {
      fetchUpdate();
    }
    // 在 store 中设置爬虫 ref
    setRef(scraperRef as React.RefObject<WebView>);
    // 在 store 中配置 portal ref
    setPortalRef(portalRef);
  }, [initVisualScheme, setPortalRef, setRef]);

  React.useEffect(() => {
    initApp();
    const listener = Appearance.addChangeListener(scheme => {
      console.log('toggled change scheme', scheme);
      if (isAutoTheme) {
        changeTheme(scheme.colorScheme === 'dark' ? 'dark' : 'light');
      }
    });
    return () => listener.remove();
  }, [isAutoTheme, changeTheme, initApp]);

  return (
    <Provider
      theme={{
        brand_primary: commonColors.purple,
        border_color_base: '#dddddd', // 基础的
        border_color_thin: '#D8D8D8', // 更细的
      }}
      onHaptics={() =>
        Platform.OS !== 'web' &&
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    >
      {/* 系统状态栏和导航栏管理 */}
      <SystemBars style="auto" />
      {/* Provider 中带有 Portal，没有 Provider，Toast 和 Modal 会失效，误删  */}
      {/* FIX_ME 自建 portal 组件，支持自定义 Toast Modal */}
      {/* 手势检测 */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Scraper
          ref={ref as React.RefObject<WebView<any> | null>}
          onMessage={handleMessage}
        ></Scraper>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerBackVisible: false,
              headerShown: false,
            }}
          >
            {['index'].map(name => (
              <Stack.Screen
                key={name}
                name={name}
                options={{ headerShown: false }}
              />
            ))}
          </Stack>
          {/* portal */}
          <PortalRoot ref={portalRef} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
