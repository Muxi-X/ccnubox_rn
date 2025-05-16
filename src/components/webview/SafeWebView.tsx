import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';

interface SafeWebViewProps extends WebViewProps {
  fallbackComponent?: React.ReactNode;
}

const SafeWebView: React.FC<SafeWebViewProps> = props => {
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0); // Used to force remount

  const handleError = () => {
    setHasError(true);
    // Log error to your error tracking service
    console.error('WebView crashed or failed to load');
  };

  const handleReload = () => {
    setHasError(false);
    setKey(prev => prev + 1); // Force remount
  };

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        {props.fallbackComponent || (
          <>
            <Text style={styles.errorText}>WebView failed to load</Text>
            <Button title="Retry" onPress={handleReload} />
          </>
        )}
      </View>
    );
  }

  return (
    <WebView
      key={key}
      {...props}
      onError={handleError}
      onHttpError={handleError}
      onProcessDidTerminate={() => {
        console.log('WebView process terminated, reloading...');
        handleReload();
      }}
      onShouldStartLoadWithRequest={request => {
        // Basic URL validation
        const isValid =
          request.url.startsWith('http') || request.url.startsWith('https');
        if (!isValid) {
          handleError();
          return false;
        }
        return props.onShouldStartLoadWithRequest?.(request) ?? true;
      }}
    />
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    fontSize: 16,
  },
});

export default SafeWebView;
