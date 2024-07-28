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
  changeColorStyle: type =>
    set(state => {
      const { styles, name, currentStyle } = state;
      const currentTheme = styles.get(name);
      return {
        ...state,
        currentStyle: currentTheme ? currentTheme[type] : currentStyle,
      };
    }),
  changeLayoutStyle: type =>
    set(state => {
      const { name, styles, currentStyle } = state;
      const newStyle = styles.get(name)![type];
      return { ...state, currentStyle: newStyle ?? currentStyle };
    }),
}));

export default useVisualScheme;
