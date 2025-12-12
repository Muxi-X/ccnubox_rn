const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.projectRoot = __dirname;

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg', 'd.ts'],
  blockList: [
    /\/\.expo\/.*/,
    /\/node_modules\/.*\/node_modules\/react-native\/.*/,
  ],
};

module.exports = config;
