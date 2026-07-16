import * as Updates from 'expo-updates';

export type EasUpdateResult =
  | { status: 'disabled' }
  | { status: 'up-to-date' }
  | { status: 'downloaded' };

export type EasUpdateProgress = 'checking' | 'downloading';

type EasUpdateOptions = {
  hasAvailableUpdate?: boolean;
  onProgress?: (progress: EasUpdateProgress) => void;
};

let activeUpdateOperation: Promise<EasUpdateResult> | null = null;

const runUpdateOperation = async (
  options: EasUpdateOptions,
): Promise<EasUpdateResult> => {
  if (!Updates.isEnabled) {
    return { status: 'disabled' };
  }

  if (!options.hasAvailableUpdate) {
    options.onProgress?.('checking');
    const checkResult = await Updates.checkForUpdateAsync();
    if (!checkResult.isAvailable && !checkResult.isRollBackToEmbedded) {
      return { status: 'up-to-date' };
    }
  }

  options.onProgress?.('downloading');
  const fetchResult = await Updates.fetchUpdateAsync();
  if (fetchResult.isNew || fetchResult.isRollBackToEmbedded) {
    return { status: 'downloaded' };
  }

  return { status: 'up-to-date' };
};

export const checkAndDownloadUpdateAsync = (
  options: EasUpdateOptions = {},
): Promise<EasUpdateResult> => {
  if (activeUpdateOperation) {
    return activeUpdateOperation;
  }

  activeUpdateOperation = runUpdateOperation(options).finally(() => {
    activeUpdateOperation = null;
  });

  return activeUpdateOperation;
};
