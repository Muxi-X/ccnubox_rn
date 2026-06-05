import * as React from 'react';

const emptyUpdateCheckResult = {
  isAvailable: false,
  manifest: undefined,
  manifestString: undefined,
  reason: undefined,
} as const;

const emptyFetchUpdateResult = {
  isNew: false,
  isRollBackToEmbedded: false,
  manifest: undefined,
} as const;

export const checkForUpdateAsync = async () => emptyUpdateCheckResult;

export const fetchUpdateAsync = async () => emptyFetchUpdateResult;

export const reloadAsync = async () => {};

export const useUpdates = () => {
  return React.useMemo(
    () => ({
      currentlyRunning: {
        channel: null,
        createdAt: null,
        isEmbeddedLaunch: true,
        isEmergencyLaunch: false,
        launchDuration: null,
        manifest: null,
        runtimeVersion: null,
        updateId: null,
      },
      availableUpdate: null,
      checkError: null,
      downloadError: null,
      isChecking: false,
      isDownloading: false,
      isRestarting: false,
      isUpdateAvailable: false,
      isUpdatePending: false,
      lastCheckForUpdateTimeSinceRestart: null,
    }),
    []
  );
};
