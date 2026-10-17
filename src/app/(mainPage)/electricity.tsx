import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import SafeWebView from '@/components/webview/SafeWebView';
import { isHarmony } from '@/platform/runtime';

export default function Electricity() {
  return isHarmony ? (
    <SafeWebView
      style={styles.container}
      source={{
        uri: 'https://jnb.ccnu.edu.cn/#/home',
      }}
      fallbackTitle="暂不支持内嵌电费页面"
      fallbackMessage="鸿蒙适配阶段请改用系统浏览器打开电费查询页面。"
    />
  ) : (
    <WebView
      style={styles.container}
      source={{
        uri: 'https://jnb.ccnu.edu.cn/#/home',
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
