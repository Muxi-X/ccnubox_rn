import { WebView } from 'react-native-webview';

const HarmonyPdfRenderer = ({ source }: { source?: string }) => {
  if (!source) return null;

  // ArkWeb previews sandbox PDFs without PDFKit, which is absent on some emulators.
  return (
    <WebView
      source={{ uri: source }}
      originWhitelist={['file://*']}
      allowFileAccess
      domStorageEnabled
      javaScriptEnabled
      scalesPageToFit
      style={{ flex: 1 }}
    />
  );
};

export default HarmonyPdfRenderer;
