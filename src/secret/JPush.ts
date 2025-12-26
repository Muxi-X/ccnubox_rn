/**
 * JPush 配置信息
 * 从环境变量中读取
 */
export const JPushSecrets = {
  appKey: process.env.JPUSH_APP_KEY || '',
  channel: process.env.JPUSH_CHANNEL || '',
};
