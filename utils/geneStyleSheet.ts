import { StyleSheet } from 'react-native';

import { SubThemeType, ThemeType } from '@/styles/types';

/** 生成对应样式（android/ios）
 * StyleShhet.create 优化性能
 */
export const geneStyleSheet = (theme: ThemeType) => {
  const themeStyleSplit = Object.entries(theme);
  return themeStyleSplit.reduce((prev, acc) => {
    return { ...prev, [acc[0]]: StyleSheet.create(acc[1]) as SubThemeType };
  }, {}) as ThemeType;
};
