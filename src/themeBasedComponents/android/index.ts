import { ThemeBasedComponentRecord } from '@/store/types';

import CourseItem from '@/themeBasedComponents/android/courseItem';
import HeaderCenter from '@/themeBasedComponents/android/headerCenter';
import HeaderLeft from '@/themeBasedComponents/android/headerLeft';
import HeaderRight from '@/themeBasedComponents/android/headerRight';

/** android 可替换组件 */
export const defaultAndroidComponents: ThemeBasedComponentRecord = {
  HeaderLeft: HeaderLeft,
  HeaderCenter: HeaderCenter,
  HeaderRight: HeaderRight,
  CourseItem: CourseItem,
};
