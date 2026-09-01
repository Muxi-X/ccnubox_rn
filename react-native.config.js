const isHarmonyCommand = process.argv.some(
  argument => argument === 'bundle-harmony' || argument === 'codegen-harmony'
);

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
  ...(isHarmonyCommand
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
