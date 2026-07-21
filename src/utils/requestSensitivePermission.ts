import AsyncStorage from '@react-native-async-storage/async-storage';

import useSensitivePermissionStore, {
  type SensitivePermissionPurpose,
} from '@/store/sensitivePermission';

type SensitivePermissionRequest<TPermission> = {
  getPermission: () => Promise<TPermission>;
  isGranted: (permission: TPermission) => boolean;
  purpose: SensitivePermissionPurpose;
  requestPermission: () => Promise<TPermission>;
};

type SensitiveAction<T> = {
  action: () => Promise<T>;
  purpose: SensitivePermissionPurpose;
};

let nextRequestId = 0;
let permissionRequestQueue: Promise<void> = Promise.resolve();
const acknowledgedPurposeIds = new Set<string>();
const PURPOSE_ACKNOWLEDGEMENT_PREFIX = '@ccnubox/sensitive-permission-purpose/';

const waitForNoticePaint = () =>
  new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const canAskForPermission = (permission: unknown) => {
  if (!permission || typeof permission !== 'object') return true;
  if (!('canAskAgain' in permission)) return true;
  return permission.canAskAgain !== false;
};

const enqueueSensitiveOperation = <T>(operation: () => Promise<T>) => {
  const result = permissionRequestQueue.then(operation);
  permissionRequestQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
};

const hasAcknowledgedPurpose = async (purposeId: string) => {
  if (acknowledgedPurposeIds.has(purposeId)) return true;
  try {
    const acknowledged =
      (await AsyncStorage.getItem(
        `${PURPOSE_ACKNOWLEDGEMENT_PREFIX}${purposeId}`
      )) === 'true';
    if (acknowledged) acknowledgedPurposeIds.add(purposeId);
    return acknowledged;
  } catch {
    return false;
  }
};

const acknowledgePurpose = async (purposeId: string) => {
  acknowledgedPurposeIds.add(purposeId);
  try {
    await AsyncStorage.setItem(
      `${PURPOSE_ACKNOWLEDGEMENT_PREFIX}${purposeId}`,
      'true'
    );
  } catch {
    // The in-memory acknowledgement still prevents repeated prompts this session.
  }
};

const runWithPurposeNotice = async <T>({
  action,
  purpose,
}: SensitiveAction<T>): Promise<T | null> => {
  if (await hasAcknowledgedPurpose(purpose.id)) {
    return action();
  }

  const requestId = ++nextRequestId;
  const { showNotice } = useSensitivePermissionStore.getState();
  const confirmed = await showNotice(requestId, purpose);
  if (!confirmed) return null;

  try {
    await acknowledgePurpose(purpose.id);
    await waitForNoticePaint();
    return await action();
  } finally {
    useSensitivePermissionStore.getState().hideNotice(requestId);
  }
};

/**
 * 在执行会打开系统敏感数据界面的操作前展示用途说明。
 * 适用于 Android Photo Picker 等无需运行时权限、但仍需说明用途的系统界面。
 */
export const runSensitiveAction = <T>(request: SensitiveAction<T>) =>
  enqueueSensitiveOperation(() => runWithPurposeNotice(request));

/**
 * 统一执行敏感权限申请：已授权时直接返回；未授权时展示用途说明，
 * 待说明渲染后调用系统权限框，并保持说明可见直至系统请求结束。
 * 多个权限申请会按触发顺序串行执行，避免系统弹窗互相覆盖。
 */
export const requestSensitivePermission = <TPermission>({
  getPermission,
  isGranted,
  purpose,
  requestPermission,
}: SensitivePermissionRequest<TPermission>): Promise<boolean> => {
  const runRequest = async () => {
    const currentPermission = await getPermission();
    if (isGranted(currentPermission)) return true;
    if (!canAskForPermission(currentPermission)) return false;

    const requestedPermission = await runWithPurposeNotice({
      action: requestPermission,
      purpose,
    });
    return requestedPermission === null
      ? false
      : isGranted(requestedPermission);
  };

  return enqueueSensitiveOperation(runRequest);
};
