import 'dotenv-flow/config';

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
