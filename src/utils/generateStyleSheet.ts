import { StyleSheet } from 'react-native';

import baseStyle from '@/styles/base';
import { LayoutType, ThemeName, ThemeType } from '@/styles/types';

/** 生成对应样式（android/ios）
 * StyleSheet.create 优化性能
 * @param theme `ThemeType`主题配置
 */
const generateStyleSheet = (theme: ThemeType): LayoutType => {
  return Object.entries(theme).reduce((styles, [key, themeStyles]) => {
    const style = StyleSheet.create({
      ...baseStyle[key as ThemeName],
      ...themeStyles,
    });
    return {
      ...styles,
      [key]: style,
    };
  }, {} as LayoutType);
};

export default generateStyleSheet;
