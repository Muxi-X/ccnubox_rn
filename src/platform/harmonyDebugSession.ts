import { authStorageKeys } from './authStorageKeys';
import { isHarmony } from './runtime';
import { deleteItemAsync, getItem, setItem } from './storage';

export const HARMONY_DEBUG_SESSION_KEY = 'harmonyDebugSession';
export const HARMONY_DEBUG_SHORT_VALUE = 'hdbg-short';
export const HARMONY_DEBUG_LONG_VALUE = 'hdbg-long';

export const canUseHarmonyDebugSession = isHarmony && __DEV__;

export const isHarmonyDebugCredential = (value?: string | null) => {
  return typeof value === 'string' && value.startsWith('hdbg-');
};

export const isHarmonyDebugSessionEnabled = async () => {
  if (!canUseHarmonyDebugSession) {
    return false;
  }

  const currentSession = await getItem(HARMONY_DEBUG_SESSION_KEY);
  return currentSession === 'enabled';
};

export const startHarmonyDebugSession = async () => {
  if (!canUseHarmonyDebugSession) {
    return;
  }

  await Promise.all([
    setItem(HARMONY_DEBUG_SESSION_KEY, 'enabled'),
    setItem(authStorageKeys.short, HARMONY_DEBUG_SHORT_VALUE),
    setItem(authStorageKeys.long, HARMONY_DEBUG_LONG_VALUE),
  ]);
};

export const clearHarmonyDebugSession = async () => {
  await deleteItemAsync(HARMONY_DEBUG_SESSION_KEY);
};
