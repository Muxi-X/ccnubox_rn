import * as FileSystem from 'expo-file-system';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import PdfRendererView from 'react-native-pdf-renderer';
import { WebView } from 'react-native-webview';

import Text from '@/components/text';
import View from '@/components/view';

// 这个链接去本科生院的华大校历找：https://jwc.ccnu.edu.cn/index/hdxl.htm
const pdfUrl =
  'https://jwc.ccnu.edu.cn/virtual_attach_file.vsb?afc=dLm--8M8-bM47YLWzviLNMRnRQ2LzCHYLm6fnRv8ozLbUmU0gihFp2hmCIa0Mky4oSyYMYh7nlUiMz6VL7-YM7UDU87sM4NaLlUbLllYLmVFUmC8o7UZUlQFLzN8UNr7gjfNQmOeo4xmCDbigDTJQty0Lz74L1yYMmUsLSbw62g8c&oid=1203777467&tid=1132&nid=26471&e=.pdf';

export default function Calendar() {
  return Platform.select({
    ios: (
      <WebView
        style={styles.container}
        source={{
          uri: pdfUrl,
          cache: true,
        }}
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={`
          document.body.style.overflowX = 'hidden';
        `}
      />
    ),
    android: <AndroidCalendar />,
  });
}

const AndroidCalendar: React.FC = () => {
  const [downloading, setDownloading] = React.useState<boolean>(false);
  const [source, setSource] = React.useState<string>();

  const downloadWithExpoFileSystem = React.useCallback(async () => {
    try {
      setDownloading(true);
      const response = await FileSystem.downloadAsync(
        pdfUrl,
        FileSystem.documentDirectory + 'file.pdf'
      );
      setSource(response.uri);
    } catch (err) {
      //console.warn(err);
    } finally {
      setDownloading(false);
    }
  }, []);

  React.useEffect(() => {
    downloadWithExpoFileSystem();
    // downloadWithBlobUtil();
  }, [downloadWithExpoFileSystem]);

  if (downloading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7878F8" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return <PdfRendererView source={source}></PdfRendererView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    paddingVertical: 10,
  },
});
