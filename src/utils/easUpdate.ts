import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

import { logger } from './logger';

export type EasUpdateResult =
  | { status: 'disabled' }
  | { status: 'up-to-date' }
  | { status: 'downloaded' }
  | { status: 'error'; error: Error };

export type EasUpdateProgress = 'checking' | 'downloading';

export type EasUpdateOptions = {
  hasAvailableUpdate?: boolean;
  onProgress?: (_progress: EasUpdateProgress) => void;
  timeoutMs?: number;
};

let activeUpdateOperation: Promise<EasUpdateResult> | null = null;

/**
 * 带有超时保护的 Promise 执行封装
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * 安全检查是否有可用更新
 */
export async function checkForUpdateSafe(
  timeoutMs: number = 10000
): Promise<Updates.UpdateCheckResult> {
  if (!Updates.isEnabled) {
    throw new Error('当前环境未启用热更新功能');
  }
  return await withTimeout(
    Updates.checkForUpdateAsync(),
    timeoutMs,
    '检查更新超时，请检查网络连接'
  );
}

/**
 * 安全下载可用更新
 */
export async function fetchUpdateSafe(
  timeoutMs: number = 60000
): Promise<Updates.UpdateFetchResult> {
  if (!Updates.isEnabled) {
    throw new Error('当前环境未启用热更新功能');
  }
  return await withTimeout(
    Updates.fetchUpdateAsync(),
    timeoutMs,
    '下载更新超时，请稍后重试'
  );
}

/**
 * 安全重启应用以应用更新
 */
export async function reloadAppSafe(): Promise<void> {
  if (!Updates.isEnabled) {
    throw new Error('当前环境未启用热更新功能');
  }
  await Updates.reloadAsync();
}

/**
 * 执行完整的检查并下载更新流程（兼容模式）
 */
export const checkAndDownloadUpdateAsync = (
  options: EasUpdateOptions = {}
): Promise<EasUpdateResult> => {
  if (activeUpdateOperation) {
    return activeUpdateOperation;
  }

  activeUpdateOperation = (async (): Promise<EasUpdateResult> => {
    if (!Updates.isEnabled) {
      return { status: 'disabled' };
    }

    try {
      if (!options.hasAvailableUpdate) {
        options.onProgress?.('checking');
        const checkResult = await checkForUpdateSafe(
          options.timeoutMs ?? 10000
        );
        if (!checkResult.isAvailable && !checkResult.isRollBackToEmbedded) {
          return { status: 'up-to-date' };
        }
      }

      options.onProgress?.('downloading');
      const fetchResult = await fetchUpdateSafe(options.timeoutMs ?? 60000);
      if (fetchResult.isNew || fetchResult.isRollBackToEmbedded) {
        return { status: 'downloaded' };
      }

      return { status: 'up-to-date' };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('[Updates] checkAndDownloadUpdateAsync 执行异常', error);
      return { status: 'error', error };
    }
  })().finally(() => {
    activeUpdateOperation = null;
    void reportUpdatesLogs(60000);
  });

  return activeUpdateOperation;
};

/**
 * 获取 Updates 相关的完整基本运行信息
 */
export function getUpdatesBasicInfo() {
  return {
    isEnabled: Updates.isEnabled,
    updateId: Updates.updateId,
    channel: Updates.channel,
    runtimeVersion: Updates.runtimeVersion,
    checkAutomatically: Updates.checkAutomatically,
    isEmbeddedLaunch: Updates.isEmbeddedLaunch,
    isEmergencyLaunch: Updates.isEmergencyLaunch,
    emergencyLaunchReason: Updates.emergencyLaunchReason,
    launchDuration: Updates.launchDuration,
    isUsingEmbeddedAssets: Updates.isUsingEmbeddedAssets,
    createdAt: Updates.createdAt ? Updates.createdAt.toISOString() : null,
    manifest: Updates.manifest,
    appVersion: Application.nativeApplicationVersion,
    buildVersion: Application.nativeBuildVersion,
    platform: Platform.OS,
    platformVersion: Platform.Version,
  };
}

/**
 * 读取并使用系统 logger 输出 expo-updates 的原生日志条目及完整基本信息
 * @param maxAgeMs 读取过去多长时间内的日志（毫秒，默认 1 小时）
 */
export async function reportUpdatesLogs(
  maxAgeMs: number = 3600000
): Promise<void> {
  const basicInfo = getUpdatesBasicInfo();
  logger.info('[expo-updates] Updates 运行环境完整基础信息', basicInfo);

  if (typeof Updates.readLogEntriesAsync !== 'function') {
    logger.warn('[expo-updates] 当前环境不支持 readLogEntriesAsync');
    return;
  }

  try {
    const logEntries = await Updates.readLogEntriesAsync(maxAgeMs);
    logger.info(
      `[expo-updates] 读取到原生日志条目共 ${logEntries.length} 条（过去 ${Math.round(maxAgeMs / 60000)} 分钟）`
    );

    logEntries.forEach(entry => {
      const { level, message, ...extra } = entry;
      const formattedMessage = `[expo-updates] ${message}`;
      const normalizedLevel = (level ?? 'info').toLowerCase();
      const payload = {
        ...extra,
        updatesBasicInfo: basicInfo,
      };

      switch (normalizedLevel) {
        case 'trace':
          logger.trace(formattedMessage, payload);
          break;
        case 'debug':
          logger.debug(formattedMessage, payload);
          break;
        case 'warn':
          logger.warn(formattedMessage, payload);
          break;
        case 'error':
          logger.error(formattedMessage, payload);
          break;
        case 'fatal':
          logger.fatal(formattedMessage, payload);
          break;
        case 'info':
        default:
          logger.info(formattedMessage, payload);
          break;
      }
    });
  } catch (error) {
    logger.error('Failed to read expo-updates logs:', error, {
      updatesBasicInfo: basicInfo,
    });
  }
}
