import * as Application from 'expo-application';
import * as Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import Button from '@/components/button';
import Toast from '@/components/toast';
import { TypoText } from '@/components/typography/TypoText';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import {
  checkAndDownloadUpdateAsync,
  type EasUpdateProgress,
} from '@/utils/easUpdate';

import { UpdateInfo } from '@/types/updateInfo';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mxLogo = require('../../assets/images/mx-logo.png');

function CheckUpdate(): React.ReactNode {
  const version = Application.nativeApplicationVersion;
  const updateInfo = Constants.default.expoConfig?.extra
    ?.updateInfo as UpdateInfo | undefined;
  const [manualProgress, setManualProgress] = useState<
    EasUpdateProgress | 'restarting' | null
  >(null);
  const [hasDownloadedUpdate, setHasDownloadedUpdate] = useState(false);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const {
    downloadProgress,
    isChecking,
    isDownloading,
    isRestarting,
    isStartupProcedureRunning,
    isUpdateAvailable,
    isUpdatePending,
  } = Updates.useUpdates();

  const canRestart = isUpdatePending || hasDownloadedUpdate;
  const isBusy =
    manualProgress !== null ||
    isChecking ||
    isDownloading ||
    isRestarting ||
    isStartupProcedureRunning;

  const buttonLabel = useMemo(() => {
    if (manualProgress === 'restarting' || isRestarting) return '正在重启…';
    if (manualProgress === 'downloading' || isDownloading) {
      return downloadProgress === undefined
        ? '正在下载…'
        : `正在下载 ${Math.round(downloadProgress * 100)}%`;
    }
    if (
      manualProgress === 'checking' ||
      isChecking ||
      isStartupProcedureRunning
    )
      return '正在检查…';
    if (canRestart) return '立即重启应用';
    if (isUpdateAvailable && !isUpdatePending) return '下载更新';
    return '检查更新';
  }, [
    canRestart,
    downloadProgress,
    isChecking,
    isDownloading,
    isRestarting,
    isStartupProcedureRunning,
    isUpdateAvailable,
    isUpdatePending,
    manualProgress,
  ]);

  const statusText = useMemo(() => {
    if (manualProgress === 'restarting' || isRestarting)
      return '正在应用更新，请稍候。';
    if (manualProgress === 'downloading' || isDownloading)
      return '正在下载更新，请保持网络连接。';
    if (
      manualProgress === 'checking' ||
      isChecking ||
      isStartupProcedureRunning
    )
      return '正在检查是否有可用更新。';
    if (canRestart) return '更新已下载，重启应用后即可使用。';
    if (isUpdateAvailable && !isUpdatePending)
      return '发现可用更新，点击按钮开始下载。';
    return '更新会在后台自动检查，也可以在这里手动检查。';
  }, [
    canRestart,
    isChecking,
    isDownloading,
    isRestarting,
    isStartupProcedureRunning,
    isUpdateAvailable,
    isUpdatePending,
    manualProgress,
  ]);

  const handleUpdatePress = async () => {
    if (isBusy) return;

    if (canRestart) {
      setManualProgress('restarting');
      try {
        await Updates.reloadAsync();
      } catch {
        setManualProgress(null);
        Toast.show({ text: '应用更新失败，请稍后重试。' });
      }
      return;
    }

    if (__DEV__ || !Updates.isEnabled) {
      Toast.show({ text: '当前构建不支持热更新检查。' });
      return;
    }

    setManualProgress('checking');
    try {
      const result = await checkAndDownloadUpdateAsync({
        hasAvailableUpdate: isUpdateAvailable,
        onProgress: setManualProgress,
      });

      if (result.status === 'downloaded') {
        setHasDownloadedUpdate(true);
        Toast.show({ text: '更新已下载，可以立即重启应用。' });
      } else if (result.status === 'up-to-date') {
        Toast.show({ text: '已是最新版', icon: 'success' });
      } else {
        Toast.show({ text: '当前构建未启用热更新。' });
      }
    } catch {
      Toast.show({ text: '检查更新失败，请检查网络后重试。' });
    } finally {
      setManualProgress(null);
    }
  };

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
              热更新版本 {updateInfo?.otaVersion ?? Updates.runtimeVersion}
            </TypoText>
            <TypoText level="body">应用版本 {version}</TypoText>
            <TypoText level="body">{updateInfo?.updateTime ?? ''}</TypoText>
          </View>
          <View style={styles.divider} />
          <View style={styles.sectionBlock}>
            <TypoText level={3} bold style={styles.sectionTitle}>
              新增功能：
            </TypoText>
            <TypoText level="body" style={styles.sectionContent}>
              {(updateInfo?.newFeatures ?? []).join('\n')}
            </TypoText>
            <TypoText level={3} bold style={styles.sectionTitle}>
              Bug修复：
            </TypoText>
            <TypoText level="body" style={styles.sectionContent}>
              {(updateInfo?.fixedIssues ?? []).join('\n')}
            </TypoText>
            <TypoText level={3} bold style={styles.sectionTitle}>
              已知问题：
            </TypoText>
            <TypoText level="body" style={styles.sectionContent}>
              {(updateInfo?.knownIssues ?? []).join('\n')}
            </TypoText>
          </View>
          <View style={styles.divider} />
          <Button
            style={[styles.updateButton, currentStyle?.button_style]}
            onPress={() => void handleUpdatePress()}
            isLoading={isBusy}
          >
            {buttonLabel}
          </Button>
          <TypoText
            level="body"
            style={styles.bottomTip}
            accessibilityLiveRegion="polite"
          >
            {statusText}
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
