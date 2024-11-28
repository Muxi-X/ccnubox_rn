import { ThemeBasedComponentRecord } from '@/store/types';

import CourseItem from '@/themeBasedComponents/android/courseItem';
import HeaderCenter from '@/themeBasedComponents/android/headerCenter';
import HeaderLeft from '@/themeBasedComponents/android/headerLeft';

/** ios 可替换组件 */
export const defaultAndroidComponents: ThemeBasedComponentRecord = {
  header_left: HeaderLeft,
  header_center: HeaderCenter,
  course_item: CourseItem,
};
