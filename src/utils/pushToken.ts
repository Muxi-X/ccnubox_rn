import { jpushClient } from '@/utils/jpush';
/**
 * 获取推送注册ID
 * @returns 推送注册ID字符串或null
 */
export const getPushToken = async (): Promise<string | null> => {
  if (!jpushClient.isInitialized()) {
    return null;
  }

  return new Promise(resolve => {
    const invoked = jpushClient.getRegistrationID(({ registerID }) => {
      if (!registerID) {
        resolve(null);
      } else {
        resolve(registerID);
      }
    });
    if (!invoked) {
      resolve(null);
    }
  });
};

export const waitForPushToken = async (
  attempts = 8,
  intervalMs = 500
): Promise<string | null> => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const token = await getPushToken();
    if (token) {
      return token;
    }

    if (attempt < attempts - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  return null;
};
