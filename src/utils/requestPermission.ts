import AsyncStorage from '@react-native-async-storage/async-storage';

import Modal from '@/components/modal';
import { type PermissionPurpose } from '@/constants/PERMISSIONS';

export type PermissionRequest<TPermission> = {
  getPermission: () => Promise<TPermission>;
  isGranted: (permission: TPermission) => boolean;
  purpose: PermissionPurpose;
  requestPermission: () => Promise<TPermission>;
};

export type PermissionAction<T> = {
  action: () => Promise<T>;
  purpose: PermissionPurpose;
};

let permissionRequestQueue: Promise<void> = Promise.resolve();
const acknowledgedPurposeIds = new Set<string>();
const PURPOSE_ACKNOWLEDGEMENT_PREFIX = '@ccnubox/permission-purpose/';
const LEGACY_PURPOSE_ACKNOWLEDGEMENT_PREFIX =
  '@ccnubox/sensitive-permission-purpose/';

const canAskForPermission = (permission: unknown) => {
  if (!permission || typeof permission !== 'object') return true;
  if (!('canAskAgain' in permission)) return true;
  return permission.canAskAgain !== false;
};

const enqueuePermissionOperation = <T>(operation: () => Promise<T>) => {
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
      ((await AsyncStorage.getItem(
        `${PURPOSE_ACKNOWLEDGEMENT_PREFIX}${purposeId}`
      )) ||
        (await AsyncStorage.getItem(
          `${LEGACY_PURPOSE_ACKNOWLEDGEMENT_PREFIX}${purposeId}`
        ))) === 'true';
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

const showPurposeModal = (purpose: PermissionPurpose): Promise<boolean> => {
  return new Promise<boolean>(resolve => {
    let resolved = false;
    const finish = (confirmed: boolean) => {
      if (!resolved) {
        resolved = true;
        resolve(confirmed);
      }
    };

    Modal.show({
      title: purpose.title,
      children: purpose.description,
      mode: 'middle',
      confirmText: '继续',
      cancelText: '取消',
      onConfirm: () => finish(true),
      onCancel: () => finish(false),
      onClose: () => finish(false),
    });
  });
};

const runWithPurposeNotice = async <T>({
  action,
  purpose,
}: PermissionAction<T>): Promise<T | null> => {
  if (await hasAcknowledgedPurpose(purpose.id)) {
    return action();
  }

  const confirmed = await showPurposeModal(purpose);
  if (!confirmed) return null;

  await acknowledgePurpose(purpose.id);
  return await action();
};

/**
 * 在执行会打开系统敏感数据界面的操作前展示用途说明。
 * 适用于 Android Photo Picker 等无需运行时权限、但仍需说明用途的系统界面。
 */
export const runPermissionAction = <T>(request: PermissionAction<T>) =>
  enqueuePermissionOperation(() => runWithPurposeNotice(request));

/**
 * 统一执行权限申请：已授权时直接返回；未授权时展示用途说明，
 * 待说明确认后调用系统权限框。
 * 多个权限申请会按触发顺序串行执行，避免系统弹窗互相覆盖。
 */
export const requestPermission = <TPermission>({
  getPermission,
  isGranted,
  purpose,
  requestPermission: askPermission,
}: PermissionRequest<TPermission>): Promise<boolean> => {
  const runRequest = async () => {
    const currentPermission = await getPermission();
    if (isGranted(currentPermission)) return true;
    if (!canAskForPermission(currentPermission)) return false;

    const requestedPermission = await runWithPurposeNotice({
      action: askPermission,
      purpose,
    });
    return requestedPermission === null
      ? false
      : isGranted(requestedPermission);
  };

  return enqueuePermissionOperation(runRequest);
};
