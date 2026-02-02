import * as Application from 'expo-application';
import * as Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Linking, Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import Button from '@/components/button';
import Modal from '@/components/modal';
import Toast from '@/components/toast';
import { TypoText } from '@/components/typography/TypoText';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import getUpdateVersion from '@/request/api/checkUpdate';

import { UpdateInfo } from '@/types/updateInfo';

/** 比较版本号，返回 true 表示 serverVersion > currentVersion */
function isVersionGreater(
  serverVersion: string,
  currentVersion: string
): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const a = parse(serverVersion);
  const b = parse(currentVersion);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

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
    if (isUpdateAvailable) Updates.fetchUpdateAsync().then(_r => {});
  }, [isUpdateAvailable]);
  const handleCheckUpdate = useCallback(() => {
    setLoading(true);
    const currentVersion = Application.nativeApplicationVersion ?? '0';
    const storeUrl =
      (Constants.default.expoConfig?.extra as { APP_STORE_URL?: string })
        ?.APP_STORE_URL ?? '';

    if (__DEV__) {
      Toast.show({ text: '已是最新版', icon: 'success' });
      setLoading(false);
      return;
    }

    Updates.checkForUpdateAsync()
      .then(async res => {
        if (res.isAvailable) {
          // Expo 有可用 OTA 更新，由现有 useEffect 拉取并应用
          return;
        }
        // 无 OTA 更新，对比服务端 getVersion 与当前应用版本
        try {
          const apiRes = (await getUpdateVersion()) as
            | {
                data?: { version?: string };
              }
            | undefined;
          const serverVersion = apiRes?.data?.version;
          if (
            serverVersion &&
            isVersionGreater(serverVersion, currentVersion)
          ) {
            Modal.show({
              mode: 'middle',
              title: '应用市场有最新版本',
              children: '请前往应用市场更新到最新版本。',
              confirmText: '去更新',
              cancelText: '取消',
              showCancel: true,
              onConfirm: () => {
                Modal.clear();
                if (storeUrl) {
                  void Linking.openURL(storeUrl);
                } else {
                  Toast.show({
                    text:
                      Platform.OS === 'ios'
                        ? '请前往 App Store 更新'
                        : '请前往应用商店更新',
                  });
                }
              },
            });
          } else {
            Toast.show({ text: '已是最新版', icon: 'success' });
          }
        } catch {
          Toast.show({ text: '已是最新版', icon: 'success' });
        }
      })
      .catch(err => {
        Toast.show({ text: err.toString() });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
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
            onPress={handleCheckUpdate}
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
