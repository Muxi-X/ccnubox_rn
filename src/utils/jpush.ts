import JPush from 'jpush-react-native';
import { NativeModules } from 'react-native';

type RegistrationIdCallback = (result: { registerID?: string }) => void;
type NotificationListener = (result: unknown) => void;
type ConnectListener = (result: { connectEnable?: boolean }) => void;
type JPushListener =
  | RegistrationIdCallback
  | NotificationListener
  | ConnectListener;

const warnedKeys = new Set<string>();

let jpushInitialized = false;
const pendingAfterInitActions: Array<() => void> = [];

const warnOnce = (key: string, message: string) => {
  if (warnedKeys.has(key)) {
    return;
  }
  warnedKeys.add(key);
  console.warn(message);
};

const isNativeJPushAvailable = () => {
  return Boolean((NativeModules as { JPushModule?: unknown }).JPushModule);
};

const runJPushAction = (methodName: string, action: () => void) => {
  try {
    action();
    return true;
  } catch (error) {
    console.error(`[JPush] 调用 ${methodName} 失败:`, error);
    return false;
  }
};

const flushPendingAfterInitActions = () => {
  if (!jpushInitialized || pendingAfterInitActions.length === 0) {
    return;
  }

  const actions = pendingAfterInitActions.splice(
    0,
    pendingAfterInitActions.length
  );
  actions.forEach(action => {
    action();
  });
};

const invokeJPush = (
  methodName: string,
  action: () => void,
  options: {
    requireInit?: boolean;
  } = {}
) => {
  if (!isNativeJPushAvailable()) {
    warnOnce(
      `missing-native:${methodName}`,
      `[JPush] 原生模块不存在，跳过 ${methodName} 调用`
    );
    return false;
  }

  if (options.requireInit && !jpushInitialized) {
    warnOnce(
      `not-initialized:${methodName}`,
      `[JPush] 尚未初始化，暂存 ${methodName} 调用，初始化后重试`
    );
    pendingAfterInitActions.push(() => {
      runJPushAction(methodName, action);
    });
    return true;
  }

  return runJPushAction(methodName, action);
};

export const jpushClient = {
  isAvailable() {
    return isNativeJPushAvailable();
  },
  isInitialized() {
    return jpushInitialized;
  },
  markInitialized(initialized: boolean) {
    jpushInitialized = initialized;
    if (initialized) {
      flushPendingAfterInitActions();
    }
  },
  setLoggerEnable(enable: boolean) {
    return invokeJPush('setLoggerEnable', () => {
      JPush.setLoggerEnable(enable);
    });
  },
  init(params: { appKey: string; channel: string; production: boolean }) {
    return invokeJPush('init', () => {
      JPush.init(params);
    });
  },
  getRegistrationID(callback: RegistrationIdCallback) {
    return invokeJPush(
      'getRegistrationID',
      () => {
        JPush.getRegistrationID(callback);
      },
      { requireInit: true }
    );
  },
  removeListener(callback: JPushListener) {
    return invokeJPush('removeListener', () => {
      JPush.removeListener(callback);
    });
  },
  addConnectEventListener(callback: ConnectListener) {
    return invokeJPush('addConnectEventListener', () => {
      JPush.addConnectEventListener(callback);
    });
  },
  addNotificationListener(callback: NotificationListener) {
    return invokeJPush('addNotificationListener', () => {
      JPush.addNotificationListener(callback);
    });
  },
  addCustomMessageListener(callback: NotificationListener) {
    return invokeJPush('addCustomMessageListener', () => {
      JPush.addCustomMessageListener(callback);
    });
  },
  setBadge(params: { badge: number; appBadge: number }) {
    return invokeJPush(
      'setBadge',
      () => {
        JPush.setBadge(params);
      },
      { requireInit: true }
    );
  },
};
