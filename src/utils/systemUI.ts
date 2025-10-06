import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { Platform } from 'react-native';

/**
 * 设置系统UI主题
 * @param themeName 主题名称 'dark' | 'light'
 */
export const setSystemUITheme = (themeName: 'dark' | 'light') => {
  const isDark = themeName === 'dark';
  SystemUI.setBackgroundColorAsync(isDark ? '#242424' : 'white');

  // NavigationBar only on Android
  if (Platform.OS === 'android') {
    NavigationBar.setBackgroundColorAsync(isDark ? '#242424' : 'white');
    NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
  }
};
