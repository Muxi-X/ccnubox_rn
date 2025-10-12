import { ConfigContext, ExpoConfig } from 'expo/config';

import updateInfo from './src/assets/data/updateInfo.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'ccnubox',
  name: 'ccnubox',
  extra: {
    ...config.extra,
    updateInfo: updateInfo,
  },
});
