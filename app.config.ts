import 'dotenv-flow/config';

import { ConfigContext, ExpoConfig } from 'expo/config';

import updateInfo from './src/assets/data/updateInfo.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosNotificationEnv = __DEV__ ? 'development' : 'production';
  return {
    ...config,
    slug: 'ccnubox',
    name: '华师匣子',
    ios: {
      ...config.ios,
      entitlements: {
        ...config.ios?.entitlements,
        'aps-environment': iosNotificationEnv,
      },
    },
    extra: {
      ...config.extra,
      updateInfo: updateInfo,
    },
  };
};
