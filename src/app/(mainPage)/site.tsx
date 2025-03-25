import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Site() {
  return (
    <WebView
      style={styles.container}
      source={{
        uri: 'https://account.ccnu.edu.cn/cas/login?service=http://kjyy.ccnu.edu.cn/loginall.aspx?page=&pageId=1053906&wfwfid=1740&websiteId=548973',
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
