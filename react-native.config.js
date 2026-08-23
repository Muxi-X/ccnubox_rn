const isHarmonyBundle = process.argv.includes('bundle-harmony');

module.exports = {
  assets: ['node_modules/@ant-design/icons-react-native/fonts'],
  dependencies: {
    '@react-native-camera-roll/camera-roll': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
  ...(isHarmonyBundle
    ? {}
    : {
        project: {
          android: {
            unstable_reactLegacyComponentNames: ['RNPdfRendererView'],
          },
          ios: {
            unstable_reactLegacyComponentNames: ['RNPdfRendererView'],
          },
        },
      }),
};
