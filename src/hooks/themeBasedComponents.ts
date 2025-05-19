import { create } from 'zustand';

import { ThemeBasedComponentsType } from '@/store/types';

import { componentMap } from '@/themeBasedComponents';
import globalEventBus from '@/utils/eventBus';

/** 主题特定组件 */
const useThemeBasedComponents = create<ThemeBasedComponentsType>(
  (set, get) => ({
    CurrentComponents: null,
    themeBasedComponents: null,
    changeComponents: layoutName => {
      const components = get().themeBasedComponents;
      if (components) {
        set({
          CurrentComponents: components[layoutName],
        });
      }
    },
    setComponents: components => {
      set({ themeBasedComponents: components });
    },
  })
);

globalEventBus.on('layoutChange', layoutName => {
  useThemeBasedComponents.getState().changeComponents(layoutName);
});
globalEventBus.on('layoutSet', () => {
  useThemeBasedComponents.getState().setComponents(componentMap);
});

export default useThemeBasedComponents;
