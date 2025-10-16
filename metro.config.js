const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
module.exports = (async () => {
  const config = await getSentryExpoConfig(__dirname);

  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
  };

  return wrapWithReanimatedMetroConfig(config);
})();
