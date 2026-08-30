import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { layoutMap } from '@/styles';
import { LayoutName, LayoutType, SingleThemeType } from '@/styles/types';
import { setSystemUITheme } from '@/utils/systemUI';

import { LayoutSelectSpec, visualSchemeType } from './types';

const initialTheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
const initialLayout: LayoutName = Platform.OS === 'ios' ? 'ios' : 'android';
const initialLayouts = new Map(Object.entries(layoutMap)) as Map<
  LayoutName,
  LayoutType
>;
const initialCurrentStyle = layoutMap[initialLayout][
  initialTheme
] as SingleThemeType;

/** 配色、布局整体store类型 */
const useVisualScheme = create<visualSchemeType>()(
  persist(
    (set, get) => ({
      isAutoTheme: true,
      themeName: initialTheme,
      layoutName: initialLayout,
      iconStyleName: initialLayout,
      currentStyle: initialCurrentStyle,
      layouts: initialLayouts,
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
      iconStyleSelect: <T>(spec: LayoutSelectSpec<T>) => {
        const { iconStyleName } = get();
        const iconStyleSpecific = spec[iconStyleName];
        if (iconStyleSpecific !== undefined) {
          return iconStyleSpecific;
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

        throw new Error('iconStyleSelect expected at least one layout value.');
      },
      changeTheme: themeName => {
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
        });
      },
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
      },
      changeIconStyle: iconStyleName => {
        set(state => ({
          ...state,
          iconStyleName,
        }));
      },
      setAutoTheme: value => {
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
        });
      },
    }),
    {
      name: 'visualScheme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isAutoTheme: state.isAutoTheme,
        themeName: state.themeName,
        layoutName: state.layoutName,
        iconStyleName: state.iconStyleName,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          const layouts = new Map(Object.entries(layoutMap)) as Map<
            LayoutName,
            LayoutType
          >;
          const currentTheme = state.isAutoTheme
            ? Appearance.getColorScheme() === 'dark'
              ? 'dark'
              : 'light'
            : state.themeName;
          state.layouts = layouts;
          state.themeName = currentTheme;
          state.currentStyle =
            (layoutMap[state.layoutName]?.[currentTheme] as SingleThemeType) ??
            initialCurrentStyle;
          setSystemUITheme(currentTheme);
        }
      },
    }
  )
);

export default useVisualScheme;
