import { create } from 'zustand';

import globalEventBus from '@/eventBus';
import { layoutMap } from '@/styles';
import { LayoutName, LayoutType, SingleThemeType } from '@/styles/types';

import { visualSchemeType } from './types';

/** 配色、布局整体store类型 */
const useVisualScheme = create<visualSchemeType>(set => ({
  themeName: 'light',
  layoutName: 'android',
  currentStyle: null,
  layouts: new Map(),
  init: () =>
    set(state => {
      const newLayouts = new Map(Object.entries(layoutMap)) as Map<
        LayoutName,
        LayoutType
      >;
      globalEventBus.emit('layoutSet');
      globalEventBus.emit('layoutChange', state.layoutName);
      return {
        ...state,
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
  changeLayout: layoutName =>
    set(state => {
      const { themeName, layouts, currentStyle } = state;
      const newStyle = layouts.get(layoutName)![themeName] as SingleThemeType;
      globalEventBus.emit('layoutChange', layoutName);
      return {
        ...state,
        currentStyle: newStyle ?? currentStyle,
        layoutName,
      };
    }),
}));

export default useVisualScheme;
