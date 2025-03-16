import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Map() {
  return (
    <WebView
      style={styles.container}
      source={{ uri: 'https://gis.ccnu.edu.cn/' }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
