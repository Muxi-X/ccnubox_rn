import { StyleSheet } from 'react-native';

import SafeWebView from '@/components/webview/SafeWebView';

export default function Electricity() {
  return (
    <SafeWebView
      style={styles.container}
      source={{
        uri: 'https://jnb.ccnu.edu.cn/MobilePayWeb/#/home',
      }}
      fallbackTitle="暂不支持内嵌电费页面"
      fallbackMessage="鸿蒙适配阶段请改用系统浏览器打开电费查询页面。"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
