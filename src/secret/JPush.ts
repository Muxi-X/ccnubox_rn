/**
 * JPush 配置信息
 * 从环境变量中读取
 */
export const JPushSecrets = {
  appKey: process.env.EXPO_PUBLIC_JPUSH_APP_KEY || '',
  channel: process.env.EXPO_PUBLIC_JPUSH_CHANNEL || '',
};
