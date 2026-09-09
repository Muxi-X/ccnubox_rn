import dayjs from 'dayjs';
import * as Application from 'expo-application';
import * as Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import * as Updates from 'expo-updates';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import Button from '@/components/button';
import Toast from '@/components/toast';
import { TypoText } from '@/components/typography/TypoText';
import ThemeBasedView from '@/components/view';
import { isHarmony } from '@/platform/runtime';
import useVisualScheme from '@/store/visualScheme';
import { UpdateInfo } from '@/types/updateInfo';
import { getUpdatesBasicInfo, reportUpdatesLogs } from '@/utils/easUpdate';
import { logger } from '@/utils/logger';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mxLogo = require('../../assets/images/mx-logo.png');

function CheckUpdate(): React.ReactNode {
  const version = Application.nativeApplicationVersion ?? '未知';
  const updateInfo = Constants.default.expoConfig?.extra?.updateInfo as
    | UpdateInfo
    | undefined;

  const currentStyle = useVisualScheme(state => state.currentStyle);
  const themeName = useVisualScheme(state => state.themeName);
  const isDark = themeName === 'dark';

  const [isManualChecking, setIsManualChecking] = useState(false);
  const [isManualDownloading, setIsManualDownloading] = useState(false);

  const {
    currentlyRunning,
    availableUpdate,
    downloadedUpdate,
    downloadProgress,
    isChecking: hookIsChecking,
    isDownloading: hookIsDownloading,
    isRestarting,
    isStartupProcedureRunning,
    isUpdateAvailable,
    isUpdatePending,
    checkError,
    downloadError,
    lastCheckForUpdateTimeSinceRestart,
  } = Updates.useUpdates();

  const isChecking = isManualChecking || hookIsChecking;
  const isDownloading = isManualDownloading || hookIsDownloading;
  const isBusy =
    isChecking || isDownloading || isRestarting || isStartupProcedureRunning;

  const currentUpdateId = Updates.updateId ?? currentlyRunning?.updateId;
  const shortUpdateId = currentUpdateId ? currentUpdateId.slice(-8) : null;
  const availableUpdateId = availableUpdate?.updateId
    ? availableUpdate.updateId.slice(-8)
    : null;

  // 页面挂载时打印当前所有 Updates 相关基础信息
  useEffect(() => {
    logger.info('[Updates] 检查更新页面挂载，当前所有 Updates 相关基础信息', {
      updatesBasicInfo: getUpdatesBasicInfo(),
      currentlyRunning,
      availableUpdate,
      downloadedUpdate,
      isUpdateAvailable,
      isUpdatePending,
      isChecking,
      isDownloading,
      isRestarting,
      isStartupProcedureRunning,
      lastCheckForUpdateTimeSinceRestart:
        lastCheckForUpdateTimeSinceRestart?.toISOString() ?? null,
      downloadProgress,
    });
  }, []);

  // 监听检查更新异常并记录日志
  useEffect(() => {
    if (checkError) {
      logger.error('[Updates] 检查热更新异常', checkError, {
        updatesBasicInfo: getUpdatesBasicInfo(),
        currentlyRunning,
      });
    }
  }, [checkError, currentlyRunning]);

  // 监听下载更新异常并记录日志
  useEffect(() => {
    if (downloadError) {
      logger.error('[Updates] 下载热更新异常', downloadError, {
        updatesBasicInfo: getUpdatesBasicInfo(),
        availableUpdate,
        currentlyRunning,
      });
    }
  }, [downloadError, availableUpdate, currentlyRunning]);

  // 监听检测到新版本事件
  useEffect(() => {
    if (isUpdateAvailable && availableUpdate) {
      logger.info('[Updates] 状态机检测到可用热更新', {
        availableUpdate,
        currentlyRunning,
        updatesBasicInfo: getUpdatesBasicInfo(),
      });
    }
  }, [isUpdateAvailable, availableUpdate, currentlyRunning]);

  // 监听新版本下载完成就绪事件
  useEffect(() => {
    if (isUpdatePending && downloadedUpdate) {
      logger.info('[Updates] 状态机更新已下载就绪，待重启生效', {
        downloadedUpdate,
        currentlyRunning,
        updatesBasicInfo: getUpdatesBasicInfo(),
      });
    }
  }, [isUpdatePending, downloadedUpdate, currentlyRunning]);

  // 监听紧急降级启动事件
  useEffect(() => {
    if (currentlyRunning?.isEmergencyLaunch) {
      logger.warn('[Updates] 当前应用处于紧急降级启动模式', {
        currentlyRunning,
        updatesBasicInfo: getUpdatesBasicInfo(),
      });
    }
  }, [currentlyRunning]);

  const buttonLabel = useMemo(() => {
    if (isHarmony) return '查看更新方式';
    if (isRestarting) return '正在重启…';
    if (isDownloading) {
      return downloadProgress === undefined
        ? '正在下载…'
        : `正在下载 ${Math.round(downloadProgress * 100)}%`;
    }
    if (isChecking || isStartupProcedureRunning) {
      return '正在检查…';
    }
    if (isUpdatePending) return '立即重启应用';
    if (isUpdateAvailable) return '下载更新';
    return '检查更新';
  }, [
    downloadProgress,
    isChecking,
    isDownloading,
    isRestarting,
    isStartupProcedureRunning,
    isUpdateAvailable,
    isUpdatePending,
  ]);

  const statusText = useMemo(() => {
    if (isHarmony) return '鸿蒙版通过应用市场或安装包更新，不使用 EAS 热更新。';
    if (isRestarting) return '正在应用更新并重启，请稍候。';
    if (isDownloading) {
      return downloadProgress !== undefined
        ? `正在下载更新 (${Math.round(downloadProgress * 100)}%)，请保持网络连接。`
        : '正在下载更新，请保持网络连接。';
    }
    if (isChecking || isStartupProcedureRunning) {
      return '正在检查是否有可用更新。';
    }
    if (isUpdatePending) {
      return '更新已下载完成，重启应用后即可生效。';
    }
    if (isUpdateAvailable) {
      return `发现可用新版本 (ID: ${availableUpdateId || '最新'})，点击下方按钮开始下载。`;
    }
    if (downloadError) {
      return `下载更新异常：${downloadError.message}`;
    }
    if (checkError) {
      return `检查更新异常：${checkError.message}`;
    }
    if (lastCheckForUpdateTimeSinceRestart) {
      return `上次检查时间: ${dayjs(lastCheckForUpdateTimeSinceRestart).format('HH:mm:ss')}。应用会在后台自动检查，也可在此手动检查。`;
    }
    return '更新会在后台自动检查，也可以在这里手动检查。';
  }, [
    availableUpdateId,
    checkError,
    downloadError,
    downloadProgress,
    isChecking,
    isDownloading,
    isRestarting,
    isStartupProcedureRunning,
    isUpdateAvailable,
    isUpdatePending,
    lastCheckForUpdateTimeSinceRestart,
  ]);

  const handleUpdatePress = async () => {
    if (isBusy) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isHarmony) {
      Toast.show({ text: '请通过应用市场或官方安装包更新鸿蒙版。' });
      return;
    }

    // 1. 更新已就绪，立即重启
    if (isUpdatePending) {
      logger.info('[Updates] 用户触发重启应用以应用更新', {
        downloadedUpdate,
        currentlyRunning,
        updatesBasicInfo: getUpdatesBasicInfo(),
      });
      try {
        await Updates.reloadAsync();
      } catch (err) {
        logger.error('[Updates] 重启应用失败', err, {
          updatesBasicInfo: getUpdatesBasicInfo(),
        });
        Toast.show({ text: '应用更新失败，请稍后重试。' });
      }
      return;
    }

    if (__DEV__ || !Updates.isEnabled) {
      logger.info('[Updates] 当前构建环境不支持或未启用热更新', {
        updatesBasicInfo: getUpdatesBasicInfo(),
      });
      Toast.show({ text: '当前构建不支持热更新检查。' });
      return;
    }

    // 2. 如果已经检测到更新但尚未下载完成，点击下载
    if (isUpdateAvailable) {
      setIsManualDownloading(true);
      logger.info('[Updates] 用户手动触发下载更新', {
        availableUpdate,
        currentlyRunning,
        updatesBasicInfo: getUpdatesBasicInfo(),
      });
      try {
        const fetchResult = await Updates.fetchUpdateAsync();
        logger.info('[Updates] 更新下载完成', {
          fetchResult,
          availableUpdate,
          currentlyRunning,
          updatesBasicInfo: getUpdatesBasicInfo(),
        });
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Toast.show({ text: '更新已下载，可以立即重启应用。' });
      } catch (err) {
        logger.error('[Updates] 下载更新失败', err, {
          availableUpdate,
          updatesBasicInfo: getUpdatesBasicInfo(),
        });
        Toast.show({ text: '下载更新失败，请检查网络后重试。' });
      } finally {
        setIsManualDownloading(false);
        void reportUpdatesLogs(60000);
      }
      return;
    }

    // 3. 检查更新
    setIsManualChecking(true);
    logger.info('[Updates] 用户手动触发检查更新…', {
      currentlyRunning,
      updatesBasicInfo: getUpdatesBasicInfo(),
    });
    try {
      const checkResult = await Updates.checkForUpdateAsync();
      logger.info('[Updates] 检查更新完成', {
        checkResult,
        currentlyRunning,
        updatesBasicInfo: getUpdatesBasicInfo(),
      });

      if (checkResult.isAvailable) {
        Toast.show({ text: '发现新版本，正在自动下载…' });
        logger.info('[Updates] 发现新版本，开始自动下载', {
          manifest: checkResult.manifest,
          updatesBasicInfo: getUpdatesBasicInfo(),
        });
        setIsManualDownloading(true);
        const fetchResult = await Updates.fetchUpdateAsync();
        logger.info('[Updates] 更新下载完成', {
          fetchResult,
          updatesBasicInfo: getUpdatesBasicInfo(),
        });
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Toast.show({ text: '更新已下载，可以立即重启应用。' });
      } else {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Toast.show({ text: '已是最新版', icon: 'success' });
      }
    } catch (err) {
      logger.error('[Updates] 检查更新失败', err, {
        updatesBasicInfo: getUpdatesBasicInfo(),
      });
      Toast.show({ text: '检查更新失败，请检查网络后重试。' });
    } finally {
      setIsManualChecking(false);
      setIsManualDownloading(false);
      void reportUpdatesLogs(60000);
    }
  };

  const dividerStyle = useMemo(
    () => [styles.divider, { backgroundColor: isDark ? '#333333' : '#E5E6EB' }],
    [isDark]
  );

  const progressTrackStyle = useMemo(
    () => [
      styles.progressTrack,
      { backgroundColor: isDark ? '#333333' : '#E5E6EB' },
    ],
    [isDark]
  );

  return (
    <ThemeBasedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.infoContainer}>
          <Image source={mxLogo} style={styles.icon} />
          <TypoText level={1} bold style={styles.appName}>
            华师匣子
          </TypoText>

          <View style={styles.versionBlock}>
            {!isHarmony ? (
              <TypoText level={2} bold style={styles.versionTitle}>
                热更新版本 {updateInfo?.otaVersion ?? Updates.runtimeVersion}
              </TypoText>
            ) : null}
            <TypoText level="body">应用版本 {version}</TypoText>
            {updateInfo?.updateTime ? (
              <TypoText level="body">{updateInfo.updateTime}</TypoText>
            ) : null}
            <TypoText level="body" style={styles.updateIdText}>
              当前运行:{' '}
              {currentlyRunning?.isEmbeddedLaunch
                ? '内嵌构建 (Embedded)'
                : 'OTA 更新'}
              {shortUpdateId ? ` (ID: ${shortUpdateId})` : ''}
            </TypoText>
            {lastCheckForUpdateTimeSinceRestart ? (
              <TypoText level="body" style={styles.lastCheckText}>
                上次检查:{' '}
                {dayjs(lastCheckForUpdateTimeSinceRestart).format('HH:mm:ss')}
              </TypoText>
            ) : null}
          </View>

          <View style={dividerStyle} />

          <View style={styles.sectionBlock}>
            {updateInfo?.newFeatures && updateInfo.newFeatures.length > 0 ? (
              <>
                <TypoText level={3} bold style={styles.sectionTitle}>
                  新增功能：
                </TypoText>
                <TypoText level="body" style={styles.sectionContent}>
                  {updateInfo.newFeatures.map(item => `• ${item}`).join('\n')}
                </TypoText>
              </>
            ) : null}

            {updateInfo?.fixedIssues && updateInfo.fixedIssues.length > 0 ? (
              <>
                <TypoText level={3} bold style={styles.sectionTitle}>
                  Bug修复：
                </TypoText>
                <TypoText level="body" style={styles.sectionContent}>
                  {updateInfo.fixedIssues.map(item => `• ${item}`).join('\n')}
                </TypoText>
              </>
            ) : null}

            {updateInfo?.knownIssues && updateInfo.knownIssues.length > 0 ? (
              <>
                <TypoText level={3} bold style={styles.sectionTitle}>
                  已知问题：
                </TypoText>
                <TypoText level="body" style={styles.sectionContent}>
                  {updateInfo.knownIssues.map(item => `• ${item}`).join('\n')}
                </TypoText>
              </>
            ) : null}
          </View>

          <View style={dividerStyle} />

          {isDownloading && downloadProgress !== undefined ? (
            <View style={progressTrackStyle}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(
                      Math.max(downloadProgress * 100, 0),
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
          ) : null}

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
  updateIdText: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.6,
    marginBottom: 2,
  },
  lastCheckText: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.5,
    marginBottom: 4,
  },
  divider: {
    height: 1,
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
    lineHeight: 20,
  },
  progressTrack: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7B7BFF',
    borderRadius: 3,
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
