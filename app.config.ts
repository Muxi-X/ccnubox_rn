import type { ConfigContext, ExpoConfig } from 'expo/config';
import 'dotenv-flow/config';

import updateInfo from './src/assets/data/updateInfo.json' with { type: 'json' };

export default ({ config }: ConfigContext): ExpoConfig => {
  const isProduction = process.env.EXPO_PUBLIC_ENV === 'production';
  const apsEnvironment = isProduction ? 'production' : 'development';
  const plugins: (string | [] | [string] | [string, any])[] = [];
  for (const plugin of config.plugins ?? []) {
    const [name, configurations] = Array.isArray(plugin)
      ? plugin
      : [plugin, undefined];
    if (name === 'mx-jpush-expo') {
      if (!process.env.JPUSH_APP_KEY) {
        console.error('JPUSH_APP_KEY is not set');
        continue;
      }
      plugins.push([
        name,
        {
          ...configurations,
          apsForProduction: isProduction,
          appKey: process.env.JPUSH_APP_KEY,
          channel: process.env.JPUSH_CHANNEL ?? configurations?.channel ?? '',
          packageName:
            process.env.JPUSH_PKGNAME ??
            configurations?.packageName ??
            config.android?.package ??
            '',
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
      ]);
      continue;
    }
    plugins.push(plugin);
  }

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
    plugins,
    extra: {
      ...config.extra,
      updateInfo: updateInfo,
    },
  };
};
