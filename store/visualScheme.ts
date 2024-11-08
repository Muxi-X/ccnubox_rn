import { create } from 'zustand';

import { componentMap, layoutMap } from '@/styles';
import { LayoutName, LayoutType, SingleThemeType } from '@/styles/types';

import { visualSchemeType } from './types';

const useVisualScheme = create<visualSchemeType>(set => ({
  themeName: 'light',
  layoutName: 'android',
  currentStyle: null,
  themeBasedComponents: { android: {}, ios: {} },
  currentComponents: {},
  layouts: new Map(),
  init: () =>
    set(state => {
      const newLayouts = new Map(Object.entries(layoutMap)) as Map<
        LayoutName,
        LayoutType
      >;
      return {
        ...state,
        themeBasedComponents: componentMap,
        currentComponents: componentMap[state.layoutName],
        currentStyle: layoutMap[state.layoutName][
          state.themeName
        ] as SingleThemeType,
        layouts: newLayouts,
      };
    }),
  removeLayouts: name =>
    set(state => {
      const newLayouts = new Map(state.layouts);
      newLayouts.delete(name);
      return { ...state, layouts: newLayouts };
    }),
  // 更改主题
  changeTheme: themeName =>
    set(state => {
      const { layouts, layoutName } = state;
      const currentTheme = layouts.get(layoutName)![
        themeName
      ] as SingleThemeType;
      if (currentTheme) {
        return {
          ...state,
          currentStyle: currentTheme,
          themeName,
        };
      }
      return state;
    }),
  // 更改布局
  changeLayout: layoutName =>
    set(state => {
      const { themeName, layouts, currentStyle, themeBasedComponents } = state;
      const newStyle = layouts.get(layoutName)![themeName] as SingleThemeType;
      return {
        ...state,
        currentComponents: themeBasedComponents[layoutName],
        currentStyle: newStyle ?? currentStyle,
        layoutName,
      };
    }),
}));

export default useVisualScheme;
