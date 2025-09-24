import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { layoutMap } from '@/styles';
import { LayoutName, LayoutType, SingleThemeType } from '@/styles/types';
import globalEventBus from '@/utils/eventBus';
import { setSystemUITheme } from '@/utils/systemUI';

import { visualSchemeType } from './types';

/** 配色、布局整体store类型 */
const useVisualScheme = create<visualSchemeType>()(
  persist(
    set => ({
      isAutoTheme: true,
      themeName: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
      layoutName: Platform.OS === 'ios' ? 'ios' : 'android',
      currentStyle: null,
      layouts: new Map(),
      init: () =>
        set(state => {
          const newLayouts = new Map(Object.entries(layoutMap)) as Map<
            LayoutName,
            LayoutType
          >;
          const currentTheme = state.isAutoTheme
            ? Appearance.getColorScheme() === 'dark'
              ? 'dark'
              : 'light'
            : state.themeName;
          setSystemUITheme(currentTheme);
          globalEventBus.emit('layoutSet');
          globalEventBus.emit('layoutChange', state.layoutName);
          return {
            ...state,
            themeName: currentTheme,
            currentStyle: layoutMap[state.layoutName][
              currentTheme
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
          setSystemUITheme(themeName);
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
          const newStyle = layouts.get(layoutName)![
            themeName
          ] as SingleThemeType;
          globalEventBus.emit('layoutChange', layoutName);
          return {
            ...state,
            currentStyle: newStyle ?? currentStyle,
            layoutName,
          };
        }),
      setAutoTheme: value =>
        set(state => {
          const isAutoTheme = !!value;
          const currentTheme = isAutoTheme
            ? Appearance.getColorScheme() === 'dark'
              ? 'dark'
              : 'light'
            : state.themeName;
          setSystemUITheme(currentTheme);
          return {
            ...state,
            isAutoTheme: isAutoTheme,
            currentStyle: layoutMap[state.layoutName][
              currentTheme
            ] as SingleThemeType,
            themeName: currentTheme,
          };
        }),
    }),
    {
      name: 'visualScheme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useVisualScheme;
