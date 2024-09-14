import { SubThemeType } from '@/styles/types';
import { geneStyleSheet } from '@/utils/geneStyleSheet';

const defaultCommonStyles: Partial<SubThemeType> = {
  button_style: {
    backgroundColor: '#7B71F1',
    color: 'white',
    borderColor: '#7B71F1',
  },
};

/** 默认样式 */
export const defaultStyles = geneStyleSheet({
  android: {
    ...defaultCommonStyles,
  },
  ios: {
    ...defaultCommonStyles,
  },
});
