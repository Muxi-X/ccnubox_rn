import { SubThemeType } from '@/styles/types';
import { geneStyleSheet } from '@/utils/geneStyleSheet';

const defaultCommonStyles: Partial<SubThemeType> = {};

/** 默认样式 */
export const defaultStyles = geneStyleSheet({
  android: {
    ...defaultCommonStyles,
  },
  ios: {
    ...defaultCommonStyles,
  },
});
