import { ThemeBasedComponentRecord } from '@/store/types';

import HeaderCenter from '@/themeBasedComponents/android/headerCenter';
import HeaderLeft from '@/themeBasedComponents/android/headerLeft';
import CourseItem from '@/themeBasedComponents/android/courseItem';

/** ios 可替换组件 */
export const defaultAndroidComponents: ThemeBasedComponentRecord = {
  header_left: HeaderLeft,
  header_center: HeaderCenter,
  course_item: CourseItem,
};
