import { ThemeBasedComponentRecord } from '@/store/types';

import CourseItem from '@/themeBasedComponents/ios/courseItem';
import HeaderCenter from '@/themeBasedComponents/ios/headerCenter';
import HeaderLeft from '@/themeBasedComponents/ios/headerLeft';

/** ios 可替换组件 */
export const defaultIOSComponents: ThemeBasedComponentRecord = {
  HeaderLeft: HeaderLeft,
  HeaderCenter: HeaderCenter,
  CourseItem: CourseItem,
};
