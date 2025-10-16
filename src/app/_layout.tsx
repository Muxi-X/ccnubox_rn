import { Provider, Toast } from '@ant-design/react-native';
import * as Sentry from '@sentry/react-native';
import { ErrorBoundary } from '@sentry/react-native';
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
  dsn: process.env.SENTRY_DSN,
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
  // Performance monitoring
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
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
  replaysSessionSampleRate: 0.3,
  integrations: [Sentry.mobileReplayIntegration()],
  // Environment configuration
  environment: __DEV__ ? 'development' : 'production',
  // Debug mode
  debug: __DEV__,
  // 添加更多配置选项
  beforeSend(event) {
    // 过滤敏感信息
    if (event.exception) {
      // 可以在这里过滤掉敏感的错误信息
      // console.log('Sentry event:', event);
    }
    return event;
  },
  beforeBreadcrumb(breadcrumb) {
    // 过滤掉一些不必要的面包屑
    if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
      return null;
    }
    return breadcrumb;
  },
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
    try {
      // 引入所有样式以及基于 theme 的组件
      initVisualScheme();
      // 加载字体
      void loadAsync({
        // eslint-disable-next-line @typescript-eslint/no-require-imports
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
    } catch (error) {
      // console.error('App initialization failed:', error);
      Sentry.captureException(error);
    }
  }, [initVisualScheme]);

  React.useEffect(() => {
    initApp();
    const listener = Appearance.addChangeListener(scheme => {
      if (isAutoTheme) {
        changeTheme(scheme.colorScheme === 'dark' ? 'dark' : 'light');
      }
    });
    return () => listener.remove();
  }, [isAutoTheme]);

  // 全局错误处理
  React.useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      // console.error('Global error:', error);
      Sentry.captureException(error.error || error);
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      // console.error('Unhandled promise rejection:', event);
      Sentry.captureException(event.reason);
    };

    // 添加全局错误监听器
    if (typeof window !== 'undefined') {
      window.addEventListener('error', errorHandler);
      window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', errorHandler);
        window.removeEventListener(
          'unhandledrejection',
          unhandledRejectionHandler
        );
      }
    };
  }, []);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
export default Sentry.wrap(RootLayout);
