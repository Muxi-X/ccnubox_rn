import { StatusBar } from 'react-native';

export const setSystemUITheme = (themeName: 'dark' | 'light') => {
  const isDark = themeName === 'dark';
  StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
};
