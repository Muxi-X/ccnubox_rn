module.exports = {
  assets: ['node_modules/@ant-design/icons-react-native/fonts'],
  project: {
    android: {
      unstable_reactLegacyComponentNames: ['RNPdfRendererView'],
    },
    ios: {
      unstable_reactLegacyComponentNames: ['RNPdfRendererView'],
    },
  },
};
