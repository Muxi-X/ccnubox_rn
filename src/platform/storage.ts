import AsyncStorage from '@react-native-async-storage/async-storage';

import { platformCapabilities } from './capabilities';

const useAsyncStorageFallback =
  platformCapabilities.secureStorageBackend === 'async-storage';

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
