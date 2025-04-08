import { Dimensions, Platform, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview';

export default function Calendar() {
  const source = {
    uri: 'https://jwc.ccnu.edu.cn/virtual_attach_file.vsb?afc=NUNLTZnzM2UmLbotRAknN78olCZL8rj7U4N4Ul78nmCZUz70gihFp2hmCIa0Mky4oSyYMYh7nlUiMz6VL7-YM7UDU87sM4NaLlUbLllYLmVFUmC8o7UZUlQFLzN8UNr7gjfNQmOeo4xmCDbigDTJQty0Lz74L1yboz9PgtA8pUwcc&tid=1132&nid=9981&e=.pdf',
    cache: true,
  };

  return Platform.select({
    ios: (
      <WebView
        style={styles.container}
        source={source}
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={`
        document.body.style.overflowX = 'hidden';
      `}
      />
    ),
    android: <Pdf style={styles.container} source={source} />,
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
