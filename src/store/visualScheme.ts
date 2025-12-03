import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { layoutMap } from '@/styles';
import { LayoutName, LayoutType, SingleThemeType } from '@/styles/types';
import globalEventBus from '@/utils/eventBus';
import { setSystemUITheme } from '@/utils/systemUI';

import { LayoutSelectSpec, visualSchemeType } from './types';

/** 配色、布局整体store类型 */
const useVisualScheme = create<visualSchemeType>()(
  persist(
    (set, get) => ({
      isAutoTheme: true,
      themeName: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
      layoutName: Platform.OS === 'ios' ? 'ios' : 'android',
      currentStyle: null,
      layouts: new Map(),
      init: () => {
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
          return {
            ...state,
            themeName: currentTheme,
            currentStyle: layoutMap[state.layoutName][
              currentTheme
            ] as SingleThemeType,
            layouts: newLayouts,
          };
        });

        const { layoutName } = get();
        globalEventBus.emit('layoutSet');
        globalEventBus.emit('layoutChange', layoutName);
      },
      removeLayouts: name =>
        set(state => {
          const newLayouts = new Map(state.layouts);
          newLayouts.delete(name);
          return { ...state, layouts: newLayouts };
        }),
      layoutSelect: <T>(spec: LayoutSelectSpec<T>) => {
        const { layoutName } = get();
        const layoutSpecific = spec[layoutName];
        if (layoutSpecific !== undefined) {
          return layoutSpecific;
        }

        if (spec.default !== undefined) {
          return spec.default;
        }

        const fallbackLayouts: LayoutName[] = ['ios', 'android'];
        for (const fallback of fallbackLayouts) {
          const candidate = spec[fallback];
          if (candidate !== undefined) {
            return candidate;
          }
        }

        throw new Error('layoutSelect expected at least one layout value.');
      },
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
      changeLayout: layoutName => {
        set(state => {
          const { themeName, layouts, currentStyle } = state;
          const newStyle = layouts.get(layoutName)![
            themeName
          ] as SingleThemeType;
          return {
            ...state,
            currentStyle: newStyle ?? currentStyle,
            layoutName,
          };
        });

        globalEventBus.emit('layoutChange', layoutName);
      },
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
