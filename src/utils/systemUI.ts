import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { Platform } from 'react-native';

/**
 * 设置系统UI主题
 * @param themeName 主题名称 'dark' | 'light'
 */
export const setSystemUITheme = (themeName: 'dark' | 'light') => {
  if (themeName === 'dark') {
    SystemUI.setBackgroundColorAsync('#242424');
    if (Platform.OS !== 'ios') {
      NavigationBar.setBackgroundColorAsync('#242424');
      NavigationBar.setButtonStyleAsync('light');
    }
  } else {
    SystemUI.setBackgroundColorAsync('white');
    if (Platform.OS !== 'ios') {
      NavigationBar.setBackgroundColorAsync('white');
      NavigationBar.setButtonStyleAsync('dark');
    }
  }
};
