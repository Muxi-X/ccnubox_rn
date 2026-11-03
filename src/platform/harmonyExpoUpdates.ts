import * as React from 'react';

export const isEnabled = false;
export const runtimeVersion = null;
export const updateId = null;

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
      downloadProgress: undefined,
      downloadError: null,
      isChecking: false,
      isDownloading: false,
      isRestarting: false,
      isStartupProcedureRunning: false,
      isUpdateAvailable: false,
      isUpdatePending: false,
      lastCheckForUpdateTimeSinceRestart: null,
    }),
    []
  );
};
