import { ConfigContext, ExpoConfig } from 'expo/config';

import updateInfo from './src/assets/data/updateInfo.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'ccnubox',
  name: '华师匣子',
  extra: {
    ...config.extra,
    updateInfo: updateInfo,
  },
});
