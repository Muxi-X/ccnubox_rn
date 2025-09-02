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

const pdfUrl =
  'https://xxb.ccnu.edu.cn/virtual_attach_file.vsb?afc=Uoz9n8U462Lln7LSmAVM7-sozUZMNQzRM8WfM8MVM4UYUNl0gihFp2hmCIa0M1h2USysnkhRnmlYoRGYUzMkolMRUmrfMlU4LRC8nzVRoz6FL4QfU4nkMmnFozAfMl-Jqjfjo4OeosAZC1hXptQ0g47aM4C0LmUZokbw62l8c&oid=1258546771&tid=1076&nid=2488&e=.pdf';

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
