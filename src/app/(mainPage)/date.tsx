import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
export default function Date() {
  return (
    <WebView
      style={styles.container}
      source={{
        uri: 'https://jwc.ccnu.edu.cn/virtual_attach_file.vsb?afc=NUNLTZnzM2UmLbotRAknN78olCZL8rj7U4N4Ul78nmCZUz70gihFp2hmCIa0Mky4oSyYMYh7nlUiMz6VL7-YM7UDU87sM4NaLlUbLllYLmVFUmC8o7UZUlQFLzN8UNr7gjfNQmOeo4xmCDbigDTJQty0Lz74L1yboz9PgtA8pUwcc&tid=1132&nid=9981&e=.pdf',
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
