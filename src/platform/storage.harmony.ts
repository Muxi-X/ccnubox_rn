import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const getItemAsync = AsyncStorage.getItem;

export const setItemAsync = async (key: string, value: string) => {
  assertCanUseFallbackStorage(key, value);
  await AsyncStorage.setItem(key, value);
};

export const deleteItemAsync = AsyncStorage.removeItem;
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

export const isUsingSecureStorageFallback = true;
