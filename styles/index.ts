import { defaultStyles } from './default';
import { LayoutName, LayoutType } from './types';

export const layoutMap: Record<LayoutName, LayoutType> = {
  android: defaultStyles,
  ios: defaultStyles,
};
