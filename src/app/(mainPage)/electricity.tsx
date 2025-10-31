import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Electricity() {
  return (
    <WebView
      style={styles.container}
      source={{
        uri: 'https://jnb.ccnu.edu.cn/MobileWebPayStandard_Vue/#/home',
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
