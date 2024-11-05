import { StyleSheet } from 'react-native';

import baseStyle from '@/styles/base';
import { SubThemeType, ThemeType } from '@/styles/types';

/** 生成对应样式（android/ios）
 * StyleSheet.create 优化性能
 * @param theme `ThemeType`主题配置
 */
export const geneStyleSheet = (theme: ThemeType) => {
  const themeStyleSplit = Object.entries(theme);
  return themeStyleSplit.reduce((prev, acc) => {
    return {
      ...prev,
      [acc[0]]: StyleSheet.create({ ...baseStyle, ...acc[1] }) as SubThemeType,
    };
  }, {}) as ThemeType;
};
