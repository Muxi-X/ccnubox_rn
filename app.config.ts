import { ConfigContext, ExpoConfig } from 'expo/config';

import updateInfo from './src/assets/data/updateInfo.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'ccnubox',
  name: '华师匣子',
  extra: {
    ...config.extra,
    updateInfo: updateInfo,
    /** 应用市场链接，用于检查更新时跳转。iOS 填 App Store 链接，Android 填应用商店链接 */
    APP_STORE_URL: process.env.EXPO_PUBLIC_APP_STORE_URL ?? '',
  },
});
