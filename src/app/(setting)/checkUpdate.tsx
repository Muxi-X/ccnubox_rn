import * as Application from 'expo-application';
import * as Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/button';
import Modal from '@/components/modal';
import Toast from '@/components/toast';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { UpdateInfo } from '@/types/updateInfo';

function CheckUpdate(): React.ReactNode {
  const version = Application.nativeApplicationVersion;
  const updateInfo = Constants.default.expoConfig?.extra
    ?.updateInfo as UpdateInfo;
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
        <Text style={[styles.appName, currentStyle?.text_style]}>华师匣子</Text>
        <View style={styles.versionBlock}>
          <Text style={styles.versionTitle}>
            热更新版本 {updateInfo.otaVersion}
          </Text>
          <Text>应用版本 {version}</Text>
          <Text style={styles.versionDate}>{updateInfo.updateTime || ''}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>新增功能：</Text>
          <Text style={styles.sectionContent}>
            {(updateInfo.newFeatures || []).join('\n')}
          </Text>
          <Text style={styles.sectionTitle}>Bug修复：</Text>
          <Text style={styles.sectionContent}>
            {(updateInfo.fixedIssues || []).join('\n')}
          </Text>
          <Text style={styles.sectionTitle}>已知问题：</Text>
          <Text style={styles.sectionContent}>
            {(updateInfo.knownIssues || []).join('\n')}
          </Text>
        </View>
        <View style={styles.divider} />
        <Button
          style={[styles.updateButton, currentStyle?.button_style]}
          onPress={() => {
            setLoading(true);
            if (__DEV__) {
              Toast.show({ text: '已是最新版', icon: 'success' });
              setLoading(false);
            } else {
              Updates.checkForUpdateAsync()
                .then(res => {
                  if (!res.isAvailable) {
                    Toast.show({ text: '已是最新版', icon: 'success' });
                  }
                })
                .catch(err => {
                  Toast.show({ text: err.toString() });
                })
                .finally(() => {
                  setLoading(false);
                });
            }
          }}
          isLoading={loading}
        >
          检 查 更 新
        </Button>
        <Text style={styles.bottomTip}>更新后请重启应用以确保新功能生效。</Text>
      </View>
    </ThemeBasedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    height: '100%',
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
  versionBlock: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  versionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  versionDate: {
    fontSize: 14,
    color: '#AEAEAE',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E6EB',
    marginVertical: 16,
    width: '80%',
  },
  sectionBlock: {
    width: '70%',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'left',
  },
  sectionContent: {
    fontSize: 13,
    color: '#444',
    marginLeft: 10,
    marginBottom: 8,
    lineHeight: 20,
    textAlign: 'left',
  },
  updateButton: {
    width: '70%',
    height: 48,
    borderRadius: 16,
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 8,
    backgroundColor: '#7B7BFF',
  },
  bottomTip: {
    fontSize: 12,
    color: '#868686',
    textAlign: 'center',
    marginTop: 4,
  },
});
export default CheckUpdate;
