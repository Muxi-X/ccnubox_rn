import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactElement,
} from 'react';
import { StyleProp, ViewStyle } from 'react-native';

const NativeWebView = (
  require('react-native-webview') as typeof import('react-native-webview')
).default;

export type SafeWebViewHandle = {
  goBack: () => void;
  injectJavaScript: (_script: string) => void;
  reload: () => void;
};

export type WebViewNavigation = {
  canGoBack?: boolean;
  url: string;
};

type WebViewMessageEvent = {
  nativeEvent: {
    data: string;
  };
};

type WebViewProgressEvent = {
  nativeEvent: {
    canGoBack: boolean;
  };
};

export type SafeWebViewProps = {
  allowsBackForwardNavigationGestures?: boolean;
  allowBackForwardNavigationGestures?: boolean;
  domStorageEnabled?: boolean;
  fallbackMessage?: string;
  fallbackTitle?: string;
  geolocationEnabled?: boolean;
  injectedJavaScript?: string;
  injectedJavaScriptForMainFrameOnly?: boolean;
  javaScriptEnabled?: boolean;
  onLoadProgress?: (_event: WebViewProgressEvent) => void;
  onMessage?: (_event: WebViewMessageEvent) => void;
  onNavigationStateChange?: (_event: WebViewNavigation) => void;
  onShouldStartLoadWithRequest?: (_request: unknown) => boolean;
  originWhitelist?: string[];
  renderLoading?: () => ReactElement;
  scalesPageToFit?: boolean;
  setSupportMultipleWindows?: boolean;
  showOpenExternally?: boolean;
  source?: any;
  startInLoadingState?: boolean;
  style?: StyleProp<ViewStyle>;
};

const SafeWebView = forwardRef<SafeWebViewHandle, SafeWebViewProps>(
  (
    {
      allowsBackForwardNavigationGestures,
      fallbackMessage: _fallbackMessage,
      fallbackTitle: _fallbackTitle,
      showOpenExternally: _showOpenExternally,
      ...props
    },
    ref
  ) => {
    const nativeWebViewRef = useRef<SafeWebViewHandle | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        goBack: () => nativeWebViewRef.current?.goBack(),
        injectJavaScript: script =>
          nativeWebViewRef.current?.injectJavaScript(script),
        reload: () => nativeWebViewRef.current?.reload(),
      }),
      []
    );

    return (
      <NativeWebView
        ref={nativeWebViewRef}
        allowsBackForwardNavigationGestures={
          allowsBackForwardNavigationGestures ??
          props.allowBackForwardNavigationGestures
        }
        {...props}
      />
    );
  }
);

SafeWebView.displayName = 'SafeWebView';

export default SafeWebView;
