import { Provider, Toast } from '@ant-design/react-native';
import * as Sentry from '@sentry/react-native';
import { loadAsync } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import * as React from 'react';
import { Appearance, Platform, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import PortalRoot from '@/components/portal';
import Scraper from '@/components/scraper';

import { usePortalStore } from '@/store/portal';
import useScraper from '@/store/scraper';
import useVisualScheme from '@/store/visualScheme';

import { commonColors } from '@/styles/common';
import { fetchUpdate } from '@/utils';
Sentry.init({
  dsn: 'https://8e79e2808f488df259cd149b97152eb6@o4510171645149185.ingest.us.sentry.io/4510171652423680',
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
  // Performance monitoring
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: __DEV__ ? 1.0 : 0.1,
  // Logs
  // Enable logs to be sent to Sentry
  enableLogs: true,
  // Profiling
  // profilesSampleRate is relative to tracesSampleRate.
  // Here, we'll capture profiles for 100% of transactions.
  profilesSampleRate: __DEV__ ? 1.0 : 0.1,
  // Session Replay
  // Record session replays for 100% of errors and 10% of sessions
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: __DEV__ ? 0.5 : 0.1,
  integrations: [Sentry.mobileReplayIntegration()],
  // Environment configuration
  environment: __DEV__ ? 'development' : 'production',
  // Debug mode
  debug: __DEV__,
});
function RootLayout() {
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

  // 配置JPush,消息推送
  // try {
  //   useJPush();
  // } catch (err) {
  //   alert(JSON.stringify(err));
  //   console.error('JPush init failed:', err);
  // }

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
  }, [initVisualScheme]);

  React.useEffect(() => {
    initApp();
    const listener = Appearance.addChangeListener(scheme => {
      console.log('toggled change scheme', scheme);
      if (isAutoTheme) {
        changeTheme(scheme.colorScheme === 'dark' ? 'dark' : 'light');
      }
    });
    return () => listener.remove();
  }, [isAutoTheme]);

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
export default Sentry.wrap(RootLayout);
