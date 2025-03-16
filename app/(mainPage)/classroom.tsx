import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
export default function ClassRoom() {
  return (
    <WebView
      style={styles.container}
      source={{ uri: 'https://wx.ccnu.edu.cn/ccadult-emptyRoomCheck-app/home' }}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
