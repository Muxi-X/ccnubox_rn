import JPush from 'jpush-react-native';
/**
 * 获取推送注册ID
 * @returns 推送注册ID字符串或null
 */
export const getPushToken = async (): Promise<string | null> => {
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
