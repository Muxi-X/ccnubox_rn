import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
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
        }}
      />
    ),
    android: <AndroidCalendar />,
  });
}

const AndroidCalendar = () => {
  const [downloading, setDownloading] = useState(false);
  const [source, setSource] = useState<string>();

  const downloadWithExpoFileSystem = useCallback(async () => {
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
      console.warn(err);
    } finally {
      setDownloading(false);
    }
  }, []);

  useEffect(() => {
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
  },
});
