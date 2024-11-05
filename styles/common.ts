import { StyleSheet } from 'react-native';

import { ColorType } from '@/styles/types';

/** 与主题无关通用样式 */
export const commonStyles = StyleSheet.create({
  fontExtraLarge: {
    fontSize: 26,
  },
  fontLarge: {
    fontSize: 20,
  },
  fontMedium: {
    fontSize: 16,
  },
  fontBold: {
    fontWeight: 'bold',
  },
  TabBarPadding: {
    marginHorizontal: 30,
  },
  courseTableDividerLine: {},
});

export const commonColors: Partial<ColorType> = {
  white: '#fff',
  lightGray: '#F5F5F5',
  gray: '#ccc',
  purple: '#7B71F1',
  black: '#000',
};
