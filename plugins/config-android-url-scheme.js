const { withAndroidManifest } = require('expo/config-plugins');

/**
 * @param {string[]} packages - 允许查询/唤醒的包名列表
 * @param {string[]} schemes - 允许查询/唤醒的 scheme 列表
 * @returns {import('expo/config-plugins').ConfigPlugin}
 */
function withAndroidQueries(config, { packages = [], schemes = [] } = {}) {
  return withAndroidManifest(config, config => {
    const manifest = config.modResults.manifest;
    // 确保 <queries> 节点存在
    manifest.queries = manifest.queries || [{}];
    const queries = manifest.queries[0];
    queries.package = queries.package || [];
    queries.intent = queries.intent || [];
    // 添加包名
    packages.forEach(pkg => {
      if (
        !queries.package.some(p => p['$'] && p['$']['android:name'] === pkg)
      ) {
        queries.package.push({ $: { 'android:name': pkg } });
      }
    });
    // 添加 scheme intent
    schemes.forEach(scheme => {
      // 检查是否已存在相同 scheme intent
      const exists = queries.intent.some(intent => {
        if (!intent.action || !intent.data) return false;
        const hasView = intent.action.some(
          a => a['$']['android:name'] === 'android.intent.action.VIEW'
        );
        const hasScheme = intent.data.some(
          d => d['$']['android:scheme'] === scheme
        );
        return hasView && hasScheme;
      });
      if (!exists) {
        queries.intent.push({
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': scheme } }],
        });
      }
    });
    return config;
  });
}

module.exports = withAndroidQueries;
