import { Dimensions, StyleSheet } from 'react-native';

import SafeWebView from '@/components/webview/SafeWebView';

// 这个链接去本科生院的华大校历找：https://jwc.ccnu.edu.cn/index/hdxl.htm
const pdfUrl =
  'https://jwc.ccnu.edu.cn/system/resource/pdfjs/viewer.html?file=%2Fvirtual_attach_file.vsb%3Fafc%3DdnmG-anm6RoRA7MW7LYM7CDoR6kMNCHZoRT7MmfkMRQVoRC0gihFp2hmCIa0MkyYLkybL1y4M8nfo7LYnmlsM7CinzQfMz6fnzCPMRMRMzAFnR9ZMmV7M4VFLNQfo77bgjfNQmOeo4xmCDbigDTJQty0Lz74L1yYMmUsLSbw62g8c%26oid%3D1203777467%26tid%3D1132%26nid%3D26471%26e%3D.pdf';

export default function Calendar() {
  return (
    <SafeWebView
      style={styles.container}
      source={{
        uri: pdfUrl,
        cache: true,
      }}
      scalesPageToFit={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      fallbackTitle="当前平台暂不支持校历内嵌查看"
      fallbackMessage="鸿蒙适配阶段请改用系统浏览器打开校历页面。"
      injectedJavaScript={`
      document.body.style.overflowX = 'hidden';
    `}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
