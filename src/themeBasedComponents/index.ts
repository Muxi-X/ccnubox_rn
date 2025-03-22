import { ThemeBasedComponentMap } from '@/store/types';

import { defaultAndroidComponents } from '@/themeBasedComponents/android';
import { defaultIOSComponents } from '@/themeBasedComponents/ios';

export const componentMap: ThemeBasedComponentMap = {
  ios: defaultIOSComponents,
  android: defaultAndroidComponents,
};
