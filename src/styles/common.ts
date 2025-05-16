import { StyleSheet } from 'react-native';

import { ColorType } from '@/styles/types';

/** 与主题无关通用样式 */
export const commonStyles = StyleSheet.create({
  fontExtraLarge: {
    fontSize: 28,
  },
  fontLarge: {
    fontSize: 22,
  },
  fontMedium: {
    fontSize: 16,
  },
  fontSmall: {
    fontSize: 10,
  },
  fontExtraBold: {
    fontWeight: '900',
  },
  fontBold: {
    fontWeight: 'bold',
  },
  fontSemiBold: {
    fontWeight: '600',
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
  lightPurple: '#B8A6F5',
  gray: '#E1E2F1',
  darkGray: '#969696',
  purple: '#7B71F1',
  lightDark: '#444',
  black: '#242424',
};
