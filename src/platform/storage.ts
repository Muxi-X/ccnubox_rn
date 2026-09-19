import * as SecureStore from 'expo-secure-store';

export const deleteItemAsync = SecureStore.deleteItemAsync;
export const getItem = SecureStore.getItem;
export const getItemAsync = SecureStore.getItemAsync;
export const setItem = SecureStore.setItem;
export const setItemAsync = SecureStore.setItemAsync;

export const secureStorage = {
  ...SecureStore,
  removeItem: SecureStore.deleteItemAsync,
};

export const isUsingSecureStorageFallback = false;
