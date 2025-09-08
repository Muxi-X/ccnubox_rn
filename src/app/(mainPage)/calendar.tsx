import * as FileSystem from 'expo-file-system';
import * as React from 'react';
import { ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import PdfRendererView from 'react-native-pdf-renderer';
import { WebView } from 'react-native-webview';

import Text from '@/components/text';
import View from '@/components/view';

// 这个链接去本科生院的华大校历找：https://jwc.ccnu.edu.cn/index/hdxl.htm
const pdfUrl =
  'https://jwc.ccnu.edu.cn/system/resource/pdfjs/viewer.html?file=%2Fvirtual_attach_file.vsb%3Fafc%3DdnmG-anm6RoRA7MW7LYM7CDoR6kMNCHZoRT7MmfkMRQVoRC0gihFp2hmCIa0MkyYLkybL1y4M8nfo7LYnmlsM7CinzQfMz6fnzCPMRMRMzAFnR9ZMmV7M4VFLNQfo77bgjfNQmOeo4xmCDbigDTJQty0Lz74L1yYMmUsLSbw62g8c%26oid%3D1203777467%26tid%3D1132%26nid%3D26471%26e%3D.pdf';

export default function Calendar() {
  return (
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
  );
}
// 这个没用上 但是留着备用
// eslint-disable-next-line unused-imports/no-unused-vars
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
