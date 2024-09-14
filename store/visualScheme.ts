import { create } from 'zustand';

import { styleMap } from '@/styles';

import { visualSchemeType } from './types';

const useVisualScheme = create<visualSchemeType>(set => ({
  name: 'default',
  type: 'android',
  currentStyle: null,
  styles: new Map(),
  initStyles: () =>
    set(state => {
      const newStyles = new Map(Object.entries(styleMap));
      return {
        ...state,
        currentStyle: styleMap[state.name][state.type],
        styles: newStyles,
      };
    }),
  removeStyles: name =>
    set(state => {
      const newStyles = new Map(state.styles);
      newStyles.delete(name);
      return { ...state, styles: newStyles };
    }),
  // 更改颜色
  changeColorStyle: styleName =>
    set(state => {
      const { styles, type, currentStyle } = state;
      const currentTheme = styles.get(styleName);
      return {
        ...state,
        currentStyle: currentTheme ? currentTheme[type] : currentStyle,
      };
    }),
  // 更改布局
  changeLayoutStyle: type =>
    set(state => {
      const { name, styles, currentStyle } = state;
      const newStyle = styles.get(name)![type];
      return { ...state, currentStyle: newStyle ?? currentStyle, type };
    }),
}));

export default useVisualScheme;
