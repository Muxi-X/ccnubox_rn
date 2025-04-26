import * as FileSystem from 'expo-file-system';
import * as React from 'react';
import { Dimensions, Platform, StyleSheet, Text } from 'react-native';
import PdfRendererView from 'react-native-pdf-renderer';
import { WebView } from 'react-native-webview';

const pdfUrl =
  'https://jwc.ccnu.edu.cn/virtual_attach_file.vsb?afc=NUNLTZnzM2UmLbotRAknN78olCZL8rj7U4N4Ul78nmCZUz70gihFp2hmCIa0Mky4oSyYMYh7nlUiMz6VL7-YM7UDU87sM4NaLlUbLllYLmVFUmC8o7UZUlQFLzN8UNr7gjfNQmOeo4xmCDbigDTJQty0Lz74L1yboz9PgtA8pUwcc&tid=1132&nid=9981&e=.pdf';

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
      /**
       * Download the PDF file with any other library, like  "expo-file-system", "rn-fetch-blob" or "react-native-blob-util"
       */
      const response = await FileSystem.downloadAsync(
        pdfUrl,
        FileSystem.documentDirectory + 'file.pdf'
      );
      /*
       * Then, set the local file URI to state and pass to the PdfRendererView source prop.
       */
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
    return <Text>Downloading...</Text>;
  }

  return <PdfRendererView source={source}></PdfRendererView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
