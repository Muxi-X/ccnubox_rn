import Pdf from '@react-native-ohos/react-native-pdf';

const HarmonyPdfRenderer = ({ source }: { source?: string }) => {
  if (!source) return null;

  return <Pdf source={{ uri: source }} style={{ flex: 1 }} />;
};

export default HarmonyPdfRenderer;
