import { TurboModule, TurboModuleRegistry } from 'react-native';

interface SecureStorageModule extends TurboModule {
  deleteItem(_key: string): Promise<void>;
  getItem(_key: string): Promise<string | null>;
  setItem(_key: string, _value: string): Promise<void>;
}

const nativeStorage = TurboModuleRegistry.getEnforcing<SecureStorageModule>(
  'ExpoHarmonySecureStorage'
);

export const deleteItemAsync = nativeStorage.deleteItem.bind(nativeStorage);
export const getItemAsync = nativeStorage.getItem.bind(nativeStorage);
export const setItemAsync = nativeStorage.setItem.bind(nativeStorage);
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

export const isUsingSecureStorageFallback = false;
