import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import SafeWebView from '@/components/webview/SafeWebView';
import { isHarmony } from '@/platform/runtime';

export default function Map() {
  return isHarmony ? (
    <SafeWebView
      geolocationEnabled
      style={styles.container}
      source={{ uri: 'https://gis.ccnu.edu.cn/' }}
      fallbackTitle="当前平台暂不支持内嵌地图"
      fallbackMessage="鸿蒙适配阶段请改用系统浏览器打开校园地图。"
    />
  ) : (
    <WebView
      geolocationEnabled
      style={styles.container}
      source={{ uri: 'https://gis.ccnu.edu.cn/' }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
