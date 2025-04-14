import { create } from 'zustand';

import { ThemeBasedComponentsType } from '@/store/types';

import { EventBus } from '@/eventBus';
import { componentMap } from '@/themeBasedComponents';

/** 主题特定组件 */
const useThemeBasedComponents = create<ThemeBasedComponentsType>(
  (set, get) => ({
    currentComponents: null,
    themeBasedComponents: null,
    changeComponents: layoutName => {
      const components = get().themeBasedComponents;
      if (components) {
        set({
          currentComponents: components[layoutName],
        });
      }
    },
    setComponents: components => {
      set({ themeBasedComponents: components });
    },
  })
);

EventBus.on('layoutChange', layoutName => {
  useThemeBasedComponents.getState().changeComponents(layoutName);
});
EventBus.on('layoutSet', () => {
  useThemeBasedComponents.getState().setComponents(componentMap);
});

export default useThemeBasedComponents;
