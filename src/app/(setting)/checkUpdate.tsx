import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextStyle, View } from 'react-native';

import Button from '@/components/button';
import Modal from '@/components/modal';
import Toast from '@/components/toast';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';
function CheckUpdate(): React.ReactNode {
  const version = Application.nativeApplicationVersion;
  const [loading, setLoading] = useState(false);
  const { currentStyle } = useVisualScheme(
    ({ currentStyle, layoutName, changeTheme, changeLayout, themeName }) => ({
      currentStyle,
      changeTheme,
      themeName,
      layoutName,
      changeLayout,
    })
  );
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
  useEffect(() => {
    if (isUpdatePending) {
      void Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  useEffect(() => {
    if (isUpdateAvailable)
      Modal.show({
        title: '检测到更新',
        children: '是否更新',
        onConfirm: () => {
          Updates.fetchUpdateAsync().then(_r => {});
        },
      });
  }, [isUpdateAvailable]);
  return (
    <ThemeBasedView style={styles.container}>
      <View style={styles.infoContainer}>
        <Image
          source={require('../../assets/images/mx-logo.png')}
          style={styles.icon}
        />
        <Text style={[styles.appName, currentStyle?.text_style as TextStyle]}>
          华师匣子
        </Text>
        <Text style={[styles.version, currentStyle?.text_style as TextStyle]}>
          版本 {version}
        </Text>
        <Button
          style={[
            currentStyle?.button_style,
            { width: '60%', marginTop: 10, marginBottom: 10 },
          ]}
          onPress={() => {
            setLoading(true);
            Updates.checkForUpdateAsync()
              .then(res => {
                if (!res.isAvailable) {
                  Toast.show({ text: '已是最新版', icon: 'success' });
                }
              })
              .catch(err => {
                Toast.show({ text: '我是谁' + err.toString() });
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          isLoading={loading}
        >
          检查更新
        </Button>
      </View>
    </ThemeBasedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#666',
  },
});
export default CheckUpdate;
