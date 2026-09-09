module.exports = function (api) {
  const isHarmony = api.caller(caller => caller?.platform === 'harmony');
  if (isHarmony) {
    return {
      presets: [['babel-preset-expo', { reanimated: false, worklets: false }]],
      plugins: [require.resolve('@harmony-js/react-native-reanimated/plugin')],
    };
  }
  return {
    presets: ['babel-preset-expo'],
  };
};
