import { StatusBar } from 'react-native';

import { setPlatformSystemBarStyle } from '@/platform/systemBars';

/**
 * 设置系统UI主题
 * @param themeName 主题名称 'dark' | 'light'
 */
export const setSystemUITheme = (themeName: 'dark' | 'light') => {
  const isDark = themeName === 'dark';

  StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  setPlatformSystemBarStyle(isDark ? 'light' : 'dark');
};
