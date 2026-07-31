'use strict';

const FileSystem = require('../../.expo-harmony/shims/expo-file-system');

const STORAGE_FILE_URI =
  (FileSystem.documentDirectory || 'file:///data/storage/el2/base/files/') +
  'ccnubox-async-storage.json';

let storeCache = null;
let writeQueue = Promise.resolve();

async function loadStore() {
  if (storeCache) {
    return storeCache;
  }

  try {
    const info = await FileSystem.getInfoAsync(STORAGE_FILE_URI);

    if (!info.exists) {
      storeCache = {};
      return storeCache;
    }

    const contents = await FileSystem.readAsStringAsync(STORAGE_FILE_URI, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    storeCache = contents ? JSON.parse(contents) : {};
  } catch (_error) {
    storeCache = {};
  }

  return storeCache;
}

async function persistStore(nextStore) {
  storeCache = nextStore;
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(() =>
      FileSystem.writeAsStringAsync(
        STORAGE_FILE_URI,
        JSON.stringify(nextStore),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      )
    )
    .catch(error => {
      console.error('Harmony AsyncStorage persist failed', error);
      throw error;
    });
  return writeQueue;
}

async function withStore(mutator) {
  const currentStore = { ...(await loadStore()) };
  const result = await mutator(currentStore);
  await persistStore(currentStore);
  return result;
}

const AsyncStorage = {
  async getItem(key) {
    const currentStore = await loadStore();
    return Object.prototype.hasOwnProperty.call(currentStore, key)
      ? currentStore[key]
      : null;
  },
  async setItem(key, value) {
    await withStore(currentStore => {
      currentStore[key] = String(value);
    });
  },
  async removeItem(key) {
    await withStore(currentStore => {
      delete currentStore[key];
    });
  },
  async mergeItem(key, value) {
    await withStore(currentStore => {
      const previousValue = currentStore[key];

      if (previousValue == null) {
        currentStore[key] = String(value);
        return;
      }

      try {
        currentStore[key] = JSON.stringify({
          ...JSON.parse(previousValue),
          ...JSON.parse(String(value)),
        });
      } catch (_error) {
        currentStore[key] = String(value);
      }
    });
  },
  async clear() {
    await persistStore({});
  },
  async getAllKeys() {
    return Object.keys(await loadStore());
  },
  async multiGet(keys) {
    const currentStore = await loadStore();
    return keys.map(key => [
      key,
      Object.prototype.hasOwnProperty.call(currentStore, key)
        ? currentStore[key]
        : null,
    ]);
  },
  async multiSet(entries) {
    await withStore(currentStore => {
      for (const [key, value] of entries) {
        currentStore[key] = String(value);
      }
    });
  },
  async multiRemove(keys) {
    await withStore(currentStore => {
      for (const key of keys) {
        delete currentStore[key];
      }
    });
  },
  async multiMerge(entries) {
    for (const [key, value] of entries) {
      await AsyncStorage.mergeItem(key, value);
    }
  },
  flushGetRequests() {},
};

function useAsyncStorage(key) {
  return {
    getItem: (...args) => AsyncStorage.getItem(key, ...args),
    setItem: (...args) => AsyncStorage.setItem(key, ...args),
    mergeItem: (...args) => AsyncStorage.mergeItem(key, ...args),
    removeItem: (...args) => AsyncStorage.removeItem(key, ...args),
  };
}

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
module.exports.useAsyncStorage = useAsyncStorage;
