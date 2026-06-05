import AsyncStorage from '@react-native-async-storage/async-storage';

import { platformCapabilities } from './capabilities';

const useAsyncStorageFallback =
  platformCapabilities.secureStorageBackend === 'async-storage';
const fallbackAuthKeys = new Set(['shortToken', 'longToken']);
const fallbackUserKey = 'user';
const isHarmonyDebugCredential = (value: string) => value.startsWith('hdbg-');

const parseStoredUserPassword = (value: string) => {
  try {
    const parsed = JSON.parse(value) as { state?: { password?: unknown } };
    return parsed.state?.password;
  } catch {
    return undefined;
  }
};

const assertCanUseFallbackStorage = (key: string, value: string) => {
  if (!useAsyncStorageFallback) {
    return;
  }

  if (fallbackAuthKeys.has(key) && !isHarmonyDebugCredential(value)) {
    throw new Error(
      'Harmony secure storage fallback only accepts debug tokens'
    );
  }

  if (key === fallbackUserKey) {
    const password = parseStoredUserPassword(value);
    if (
      typeof password === 'string' &&
      password &&
      !isHarmonyDebugCredential(password)
    ) {
      throw new Error(
        'Harmony secure storage fallback will not persist real passwords'
      );
    }
  }
};

let secureStoreModule: typeof import('expo-secure-store') | null | undefined;

const getSecureStoreModule = () => {
  if (useAsyncStorageFallback) {
    return null;
  }

  if (secureStoreModule === undefined) {
    secureStoreModule =
      require('expo-secure-store') as typeof import('expo-secure-store');
  }

  return secureStoreModule;
};

const getBackend = () => {
  if (useAsyncStorageFallback) {
    return {
      deleteItemAsync: AsyncStorage.removeItem,
      getItemAsync: AsyncStorage.getItem,
      setItemAsync: AsyncStorage.setItem,
    };
  }

  return getSecureStoreModule()!;
};

export const getItemAsync = async (key: string) => {
  return getBackend().getItemAsync(key);
};

export const setItemAsync = async (key: string, value: string) => {
  assertCanUseFallbackStorage(key, value);
  await getBackend().setItemAsync(key, value);
};

export const deleteItemAsync = async (key: string) => {
  await getBackend().deleteItemAsync(key);
};

export const getItem = getItemAsync;
export const setItem = setItemAsync;

export const secureStorage = {
  deleteItemAsync,
  getItem,
  getItemAsync,
  removeItem: deleteItemAsync,
  setItem,
  setItemAsync,
};

export const isUsingSecureStorageFallback = useAsyncStorageFallback;
