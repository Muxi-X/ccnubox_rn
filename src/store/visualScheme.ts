import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import { Appearance, Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { layoutMap } from '@/styles';
import { LayoutName, LayoutType, SingleThemeType } from '@/styles/types';
import { EventBus } from '@/utils';

import { visualSchemeType } from './types';

/** 配色、布局整体store类型 */
const useVisualScheme = create<visualSchemeType>()(
  persist(
    set => ({
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
          EventBus.emit('layoutSet');
          EventBus.emit('layoutChange', state.layoutName);
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
          if (themeName === 'dark') {
            SystemUI.setBackgroundColorAsync('#242424');
          } else {
            SystemUI.setBackgroundColorAsync('white');
          }
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
          EventBus.emit('layoutChange', layoutName);
          return {
            ...state,
            currentStyle: newStyle ?? currentStyle,
            layoutName,
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
