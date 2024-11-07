import { ThemeBasedComponentMap } from '@/store/types';

import { defaultStyles } from './default';
import { LayoutName, LayoutType } from './types';

export const layoutMap: Record<LayoutName, LayoutType> = {
  android: defaultStyles,
  ios: defaultStyles,
};

export const componentMap: ThemeBasedComponentMap = {
  ios: {},
  android: {},
};
