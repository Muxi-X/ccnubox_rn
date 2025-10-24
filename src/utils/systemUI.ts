import { SystemBars } from 'react-native-edge-to-edge';

/**
 * 设置系统UI主题
 * @param themeName 主题名称 'dark' | 'light'
 */
export const setSystemUITheme = (themeName: 'dark' | 'light') => {
  const isDark = themeName === 'dark';

  // 使用 SystemBars 设置状态栏和导航栏样式
  SystemBars.setStyle(isDark ? 'light' : 'dark');
};
