import { ActivityIndicator } from '@ant-design/react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';

import SafeWebView, {
  SafeWebViewHandle,
  WebViewNavigation,
} from '@/components/webview/SafeWebView';

import useUserStore from '@/store/user';
import useVisualScheme from '@/store/visualScheme';

import { commonColors } from '@/styles/common';

export default function Webview() {
  const currentTheme = useVisualScheme().themeName;
  const [loading, setLoading] = useState(true);
  const { link } = useLocalSearchParams();
  const student_id = useUserStore(state => state.student_id);
  const storedCredential = useUserStore(state => state.password);

  const webview = useRef<SafeWebViewHandle | null>(null);
  const loginCount = useRef(0);

  const autoLogin = useCallback(
    (event: WebViewNavigation) => {
      if (event.url.includes('kickout')) {
        webview.current?.injectJavaScript(`
              window.location.href = 'https://account.ccnu.edu.cn/cas/login?service=http%3A%2F%2Fxk.ccnu.edu.cn%2Fsso%2Fpziotlogin';
              true;
            `);
      } else if (event.url.includes('cas/login')) {
        if (loginCount.current < 5)
          webview.current?.injectJavaScript(`
              (() => {
                const usernameInput = document.getElementById('username');
                const passwordInput = document.getElementById('password');
                if(!usernameInput || !passwordInput) {
                  return;
                }
                const loginButton = document.getElementsByClassName('btn-submit')[0];
                usernameInput.value = '${student_id}';
                passwordInput.value = '${storedCredential}';
                window.ReactNativeWebView.postMessage('_triedLogin');
                loginButton.click();
              })();
              true;
              `);
      }
      setLoading(false);
    },
    [student_id, storedCredential]
  );

  // 接管系统返回手势
  const [canGoBack, setCanGoBack] = useState(false);
  const onAndroidBackPress = useCallback(() => {
    if (canGoBack) {
      webview.current?.goBack();
      return true; // prevent default behavior (exit app)
    }
    return false;
  }, [canGoBack]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onAndroidBackPress
      );
      return () => {
        subscription.remove();
      };
    }
  }, [onAndroidBackPress]);

  return (
    <>
      <SafeWebView
        ref={webview}
        javaScriptEnabled
        // injectedJavaScript={login}
        geolocationEnabled
        injectedJavaScriptForMainFrameOnly={false}
        originWhitelist={['*']}
        setSupportMultipleWindows={false} // Android 必须
        onShouldStartLoadWithRequest={request => true}
        onNavigationStateChange={autoLogin}
        style={styles.container}
        onMessage={event => {
          if (event.nativeEvent.data === '_triedLogin') {
            loginCount.current++;
          }
        }}
        // 响应系统返回手势
        allowsBackForwardNavigationGestures
        onLoadProgress={event => {
          setCanGoBack(event.nativeEvent.canGoBack);
        }}
        source={{ uri: atob(link as string) }}
        startInLoadingState
        fallbackTitle="当前页面暂不支持内嵌打开"
        fallbackMessage="鸿蒙适配阶段仅保留外部打开能力，请使用系统浏览器继续访问。"
        renderLoading={() => (
          <View
            style={[
              styles.loadingView,
              {
                backgroundColor:
                  currentTheme === 'dark'
                    ? 'rgba(0,0,0,0.9)'
                    : 'rgba(0,0,0,0.1)',
              },
            ]}
          >
            <ActivityIndicator color={commonColors.purple} size="large" />
          </View>
        )}
      />
      {loading && (
        <View
          style={[
            styles.loadingView,
            {
              backgroundColor:
                currentTheme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          <ActivityIndicator color={commonColors.purple} size="large" />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingView: {
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
