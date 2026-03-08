import JPush from 'jpush-react-native';
/**
 * 获取推送注册ID
 * @returns 推送注册ID字符串或null
 */
export const getPushToken = async (): Promise<string | null> => {
  if (!JPush.getRegistrationID) {
    return null;
  }
  return new Promise(resolve => {
    JPush.getRegistrationID(({ registerID }) => {
      if (!registerID) {
        resolve(null);
      } else {
        resolve(registerID);
      }
    });
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
