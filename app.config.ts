import { withSentry } from '@sentry/react-native/expo';
import { ConfigContext, ExpoConfig } from 'expo/config';

import updateInfo from './src/assets/data/updateInfo.json';

export default ({ config }: ConfigContext): ExpoConfig =>
  withSentry(
    {
      ...config,
      slug: 'ccnubox',
      name: '华师匣子',
      extra: {
        ...config.extra,
        updateInfo: updateInfo,
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      },
    },
    (() => {
      const options: Record<string, string> = {
        url: 'https://sentry.io/',
        project: 'react-native',
        organization: 'muxi-studio-hg',
      };
      if (process.env.SENTRY_AUTH_TOKEN) {
        options.authToken = process.env.SENTRY_AUTH_TOKEN;
      }
      return options as unknown as {
        url: string;
        project: string;
        organization: string;
        authToken?: string;
      };
    })()
  );
