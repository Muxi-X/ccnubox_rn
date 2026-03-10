import { getItemAsync } from 'expo-secure-store';

import { initializeJPush } from '@/hooks/useJPush';

import usePushSubscriptionStore from '@/store/pushSubscription';

import { removeFeedToken, saveFeedToken } from '@/request/api/feeds';
import { getPushToken, waitForPushToken } from '@/utils/pushToken';

const hasLoginSession = async () => {
  const longToken = await getItemAsync('longToken');
  return Boolean(longToken);
};

export const enablePushSubscription = async () => {
  const isLoggedIn = await hasLoginSession();
  if (!isLoggedIn) {
    throw new Error('当前未登录，无法开启消息推送');
  }

  const initialized = await initializeJPush({ requestPermission: true });
  if (!initialized) {
    throw new Error('未获得系统通知权限');
  }

  const token = await waitForPushToken();
  if (!token) {
    throw new Error('获取推送标识失败，请稍后重试');
  }

  await saveFeedToken(token);

  const { setEnabled, setRegisteredToken } =
    usePushSubscriptionStore.getState();
  setEnabled(true);
  setRegisteredToken(token);

  return token;
};

export const disablePushSubscription = async () => {
  const { registeredToken, setEnabled, setRegisteredToken } =
    usePushSubscriptionStore.getState();
  const token = (await getPushToken()) || registeredToken;
  if (token) {
    await removeFeedToken(token);
  }

  setEnabled(false);
  setRegisteredToken(null);
};

export const syncPushSubscription = async () => {
  const { enabled, registeredToken, setRegisteredToken } =
    usePushSubscriptionStore.getState();

  if (!enabled) return;

  const isLoggedIn = await hasLoginSession();
  if (!isLoggedIn) return;

  const initialized = await initializeJPush();
  if (!initialized) return;

  const token = await waitForPushToken(4, 400);
  if (!token || token === registeredToken) return;

  await saveFeedToken(token);
  setRegisteredToken(token);
};
