import type { ConfigContext, ExpoConfig } from 'expo/config';

import updateInfo from './src/assets/data/updateInfo.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isProduction = process.env.EXPO_PUBLIC_ENV === 'production';
  const apsEnvironment = isProduction ? 'production' : 'development';

  return {
    ...config,
    slug: 'ccnubox',
    name: '华师匣子',
    ios: {
      ...config.ios,
      entitlements: {
        ...config.ios?.entitlements,
        'aps-environment': apsEnvironment,
      },
    },
    plugins: (config.plugins || []).map(plugin => {
      const [name, configurations] = plugin;
      if (name === 'mx-jpush-expo') {
        return [
          name,
          {
            ...configurations,
            apsForProduction: isProduction,
            appKey: process.env.JPUSH_APP_KEY ?? '',
            vendorChannels: {
              vivo: {
                appKey: process.env.JPUSH_VIVO_APP_KEY,
                appId: process.env.JPUSH_VIVO_APP_ID,
              },
              xiaomi: {
                appId: process.env.JPUSH_XIAOMI_APP_ID,
                appKey: process.env.JPUSH_XIAOMI_APP_KEY,
              },
              oppo: {
                appKey: process.env.JPUSH_OPPO_APP_KEY,
                appId: process.env.JPUSH_OPPO_APP_ID,
                appSecret: process.env.JPUSH_OPPO_APP_SECRET,
              },
              honor: {
                appId: process.env.JPUSH_HONOR_APP_ID,
              },
              huawei: {
                enabled: true,
              },
            },
          },
        ];
      }
      return plugin;
    }),
    extra: {
      ...config.extra,
      updateInfo: updateInfo,
    },
  };
};
