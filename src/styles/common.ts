import { StyleSheet } from 'react-native';

import { ColorType } from '@/styles/types';

/** 与主题无关通用样式 */
export const commonStyles = StyleSheet.create({
  fontExtraLarge: {
    fontSize: 26,
  },
  fontLarge: {
    fontSize: 24,
  },
  fontMedium: {
    fontSize: 16,
  },
  fontSmall: {
    fontSize: 10,
  },
  fontBold: {
    fontWeight: 'bold',
  },
  fontLight: {
    fontWeight: 'light',
  },
  TabBarPadding: {
    marginHorizontal: 30,
  },
  courseTableDividerLine: {
    color: '#f7f7f7',
  },
});

export const commonColors: Partial<ColorType> = {
  white: '#fff',
  lightGray: '#F5F5F5',
  gray: '#E1E2F1',
  darkGray: '#a0a0a0',
  purple: '#7B71F1',
  lightDark: '#444',
  black: '#242424',
};
