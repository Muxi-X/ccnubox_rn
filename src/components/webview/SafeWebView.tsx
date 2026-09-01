import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import type WebView from 'react-native-webview';
import type { WebViewProps } from 'react-native-webview';

const NativeWebView = (
  require('react-native-webview') as typeof import('react-native-webview')
).default;

export type SafeWebViewHandle = Pick<
  WebView,
  'goBack' | 'injectJavaScript' | 'reload'
>;

export type SafeWebViewProps = WebViewProps & {
  allowBackForwardNavigationGestures?: boolean;
  fallbackMessage?: string;
  fallbackTitle?: string;
  showOpenExternally?: boolean;
};

const SafeWebView = forwardRef<SafeWebViewHandle, SafeWebViewProps>(
  (
    {
      allowBackForwardNavigationGestures,
      allowsBackForwardNavigationGestures,
      fallbackMessage: _fallbackMessage,
      fallbackTitle: _fallbackTitle,
      showOpenExternally: _showOpenExternally,
      ...props
    },
    ref
  ) => {
    const nativeWebViewRef = useRef<WebView | null>(null);

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
          allowBackForwardNavigationGestures
        }
        {...props}
      />
    );
  }
);

SafeWebView.displayName = 'SafeWebView';

export default SafeWebView;
