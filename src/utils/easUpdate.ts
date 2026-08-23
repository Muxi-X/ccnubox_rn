import * as Updates from 'expo-updates';

export type EasUpdateResult =
  | { status: 'disabled' }
  | { status: 'up-to-date' }
  | { status: 'downloaded' };

export type EasUpdateProgress = 'checking' | 'downloading';

export type EasUpdateOptions = {
  hasAvailableUpdate?: boolean;
  onProgress?: (_progress: EasUpdateProgress) => void;
  retries?: number;
  retryDelayMs?: number;
};

let activeUpdateOperation: Promise<EasUpdateResult> | null = null;

const MANIFEST_HOST_OVERRIDE = 'ota.ccnubox.muxixyz.com';
const ASSET_HOST_OVERRIDE = 'assets.ota.ccnubox.muxixyz.com';
const UPDATE_PROJECT_ID = '65d670f0-9625-4631-9603-f4b11f44e621';

/**
 * 默认更新配置：注入 channel 为 production
 */
const applyDefaultChannelConfig = async () => {
  try {
    if (typeof Updates.setUpdateRequestHeadersOverride === 'function') {
      Updates.setUpdateRequestHeadersOverride({
        'expo-channel-name': 'production',
      });
    }
    if (typeof Updates.setExtraParamAsync === 'function') {
      await Updates.setExtraParamAsync('channel', 'production');
    }
  } catch {
    // 忽略在非支持环境或测试环境中的配置错误
  }
};

/**
 * 重试配置：除 channel: production 外，额外注入代理域名配置
 */
const applyRetryProxyConfig = async () => {
  try {
    const updateUrl = `https://${MANIFEST_HOST_OVERRIDE}/${UPDATE_PROJECT_ID}`;

    if (typeof Updates.setUpdateURLAndRequestHeadersOverride === 'function') {
      Updates.setUpdateURLAndRequestHeadersOverride({
        updateUrl,
        requestHeaders: {
          'expo-channel-name': 'production',
          'expo-asset-host-override': ASSET_HOST_OVERRIDE,
          'expo-manifest-host-override': MANIFEST_HOST_OVERRIDE,
        },
      });
    }

    if (typeof Updates.setUpdateRequestHeadersOverride === 'function') {
      Updates.setUpdateRequestHeadersOverride({
        'expo-channel-name': 'production',
        'expo-asset-host-override': ASSET_HOST_OVERRIDE,
        'expo-manifest-host-override': MANIFEST_HOST_OVERRIDE,
      });
    }

    if (typeof Updates.setExtraParamAsync === 'function') {
      await Updates.setExtraParamAsync('channel', 'production');
    }
  } catch {
    // 忽略在非支持环境或测试环境中的配置错误
  }
};

/**
 * 带有指数退避自动重试机制的异步任务封装
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000,
  onRetry?: (_attempt: number) => Promise<void> | void
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (attempt > 0 && onRetry) {
        await onRetry(attempt);
      }
      return await operation();
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, delayMs * Math.pow(2, attempt))
        );
      }
    }
  }
  throw lastError;
}

const runUpdateOperation = async (
  options: EasUpdateOptions
): Promise<EasUpdateResult> => {
  if (!Updates.isEnabled) {
    return { status: 'disabled' };
  }

  // 默认对所有更新请求注入 channel: production
  await applyDefaultChannelConfig();

  const retries = options.retries ?? 3;
  const retryDelayMs = options.retryDelayMs ?? 1000;

  if (!options.hasAvailableUpdate) {
    options.onProgress?.('checking');
    const checkResult = await retryWithBackoff(
      () => Updates.checkForUpdateAsync(),
      retries,
      retryDelayMs,
      applyRetryProxyConfig
    );
    if (!checkResult.isAvailable && !checkResult.isRollBackToEmbedded) {
      return { status: 'up-to-date' };
    }
  }

  options.onProgress?.('downloading');
  const fetchResult = await retryWithBackoff(
    () => Updates.fetchUpdateAsync(),
    retries,
    retryDelayMs,
    applyRetryProxyConfig
  );
  if (fetchResult.isNew || fetchResult.isRollBackToEmbedded) {
    return { status: 'downloaded' };
  }

  return { status: 'up-to-date' };
};

export const checkAndDownloadUpdateAsync = (
  options: EasUpdateOptions = {}
): Promise<EasUpdateResult> => {
  if (activeUpdateOperation) {
    return activeUpdateOperation;
  }

  activeUpdateOperation = runUpdateOperation(options).finally(() => {
    activeUpdateOperation = null;
  });

  return activeUpdateOperation;
};
