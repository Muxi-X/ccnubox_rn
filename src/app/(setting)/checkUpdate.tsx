import * as Application from 'expo-application';
import * as Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import Button from '@/components/button';
import Modal from '@/components/modal';
import Toast from '@/components/toast';
import { TypoText } from '@/components/typography/TypoText';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { UpdateInfo } from '@/types/updateInfo';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mxLogo = require('../../assets/images/mx-logo.png');

function CheckUpdate(): React.ReactNode {
  const version = Application.nativeApplicationVersion;
  const updateInfo = Constants.default.expoConfig?.extra
    ?.updateInfo as UpdateInfo;
  const [loading, setLoading] = useState(false);
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
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
      <ScrollView>
        <View style={styles.infoContainer}>
          <Image source={mxLogo} style={styles.icon} />
          <TypoText level={1} bold style={styles.appName}>
            华师匣子
          </TypoText>
          <View style={styles.versionBlock}>
            <TypoText level={2} bold style={styles.versionTitle}>
              热更新版本 {updateInfo.otaVersion}
            </TypoText>
            <TypoText level="body">应用版本 {version}</TypoText>
            <TypoText level="body">{updateInfo.updateTime || ''}</TypoText>
          </View>
          <View style={styles.divider} />
          <View style={styles.sectionBlock}>
            <TypoText level={3} bold style={styles.sectionTitle}>
              新增功能：
            </TypoText>
            <TypoText level="body" style={styles.sectionContent}>
              {(updateInfo.newFeatures || []).join('\n')}
            </TypoText>
            <TypoText level={3} bold style={styles.sectionTitle}>
              Bug修复：
            </TypoText>
            <TypoText level="body" style={styles.sectionContent}>
              {(updateInfo.fixedIssues || []).join('\n')}
            </TypoText>
            <TypoText level={3} bold style={styles.sectionTitle}>
              已知问题：
            </TypoText>
            <TypoText level="body" style={styles.sectionContent}>
              {(updateInfo.knownIssues || []).join('\n')}
            </TypoText>
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
          <TypoText level="body" style={styles.bottomTip}>
            更新后请重启应用以确保新功能生效。
          </TypoText>
        </View>
      </ScrollView>
    </ThemeBasedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  appName: {
    marginBottom: 4,
  },
  versionBlock: {
    alignItems: 'center',
    marginBottom: 8,
  },
  versionTitle: {
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E6EB',
    marginVertical: 12,
    width: '80%',
  },
  sectionBlock: {
    width: '85%',
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'left',
  },
  sectionContent: {
    marginLeft: 8,
    marginBottom: 4,
    textAlign: 'left',
  },
  updateButton: {
    width: '80%',
    height: 44,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#7B7BFF',
  },
  bottomTip: {
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
});
export default CheckUpdate;
