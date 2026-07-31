import { StyleSheet } from 'react-native';

import baseStyle from '@/styles/base';
import { LayoutType, ThemeName, ThemeType } from '@/styles/types';

const isNestedStyles = (v: unknown) =>
  typeof v === 'object' &&
  v !== null &&
  !Array.isArray(v) &&
  Object.values(v).every(
    inner =>
      typeof inner === 'object' && inner !== null && !Array.isArray(inner)
  );

const generateStyleSheet = (theme: ThemeType): LayoutType => {
  return Object.entries(theme).reduce((styles, [key, themeStyles]) => {
    const entries = Object.entries(themeStyles);
    const style = {
      ...StyleSheet.create({
        ...baseStyle[key as ThemeName],
        ...Object.fromEntries(entries.filter(([, v]) => !isNestedStyles(v))),
      }),
      ...Object.fromEntries(entries.filter(([, v]) => isNestedStyles(v))),
    };
    return { ...styles, [key]: style };
  }, {} as LayoutType);
};

export default generateStyleSheet;
