import { ActivityIndicator } from '@ant-design/react-native';
import { useLocalSearchParams } from 'expo-router';
import { getItem } from 'expo-secure-store';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

import useVisualScheme from '@/store/visualScheme';

import { ossLoginAndNavigate } from '@/constants/scraper';
import { commonColors } from '@/styles/common';

export default function ClassRoom() {
  const currentTheme = useVisualScheme().themeName;
  const [loading, setLoading] = useState(true);
  const { link } = useLocalSearchParams();
  let student_id = '';
  let password = '';
  const userInfo = getItem('userInfo');
  if (userInfo) {
    student_id = JSON.parse(userInfo as string)?.student_id;
    password = JSON.parse(userInfo as string)?.password;
  }
  const login = ossLoginAndNavigate(student_id, password);

  return (
    <>
      <WebView
        javaScriptEnabled
        injectedJavaScript={login}
        injectedJavaScriptForMainFrameOnly={false}
        originWhitelist={['*']}
        setSupportMultipleWindows={false} // Android 必须
        onShouldStartLoadWithRequest={request => true}
        style={styles.container}
        onMessage={event => {
          const eventName: string = event.nativeEvent.data;
          if (eventName === '_pageLoaded') {
            setLoading(false);
          } else if (eventName === '_pageStartLoading') {
            setLoading(true);
          }
        }}
        source={{ uri: atob(link as string) }}
      />
      {loading && (
        <View
          style={[
            styles.loadingView,
            {
              backgroundColor:
                currentTheme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          <ActivityIndicator color={commonColors.purple} size="large" />
        </View>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingView: {
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
