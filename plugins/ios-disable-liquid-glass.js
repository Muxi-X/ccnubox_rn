const { withAppDelegate } = require('expo/config-plugins');

/**
 * iOS 26 液态玻璃(Liquid Glass)导航栏样式禁用插件
 *
 * 在 AppDelegate 中注入 Swift 代码，全局配置 UINavigationBarAppearance 为不透明背景，
 * 禁用 iOS 26 的液态玻璃视觉效果（包括导航栏背景和返回按钮样式）。
 *
 * @returns {import('expo/config-plugins').ConfigPlugin}
 */
function withDisableLiquidGlass(config) {
  return withAppDelegate(config, config => {
    const contents = config.modResults.contents;

    // 匹配 Swift AppDelegate 中的 return super.application(...) 行
    const didFinishLaunchingReturn =
      /(return\s+super\.application\(application,\s*didFinishLaunchingWithOptions:\s*launchOptions\))/;

    const injectionCode = `
    // Disable iOS 26 Liquid Glass navigation bar appearance
    if #available(iOS 26.0, *) {
      let opaqueAppearance = UINavigationBarAppearance()
      opaqueAppearance.configureWithOpaqueBackground()
      opaqueAppearance.backgroundEffect = nil
      UINavigationBar.appearance().standardAppearance = opaqueAppearance
      UINavigationBar.appearance().scrollEdgeAppearance = opaqueAppearance
      UINavigationBar.appearance().compactAppearance = opaqueAppearance
    }
`;

    if (didFinishLaunchingReturn.test(contents)) {
      config.modResults.contents = contents.replace(
        didFinishLaunchingReturn,
        `${injectionCode}  $1`
      );
    }

    return config;
  });
}

module.exports = withDisableLiquidGlass;
