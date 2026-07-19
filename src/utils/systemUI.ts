import { isRunningInExpoGo } from 'expo';
import { StatusBar } from 'react-native';

/**
 * 设置系统UI主题
 * @param themeName 主题名称 'dark' | 'light'
 */
export const setSystemUITheme = (themeName: 'dark' | 'light') => {
  const isDark = themeName === 'dark';

  StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);

  if (isRunningInExpoGo()) return;

  void import('react-native-edge-to-edge')
    .then(({ SystemBars }) => {
      SystemBars.setStyle(isDark ? 'light' : 'dark');
    })
    .catch(() => {
      // Expo Go and older native clients do not include this module.
    });
};
