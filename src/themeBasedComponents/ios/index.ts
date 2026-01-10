import { ThemeBasedComponentRecord } from '@/store/types';

import CourseItem from '@/themeBasedComponents/ios/courseItem';
import HeaderCenter from '@/themeBasedComponents/ios/headerCenter';
import HeaderLeft from '@/themeBasedComponents/ios/headerLeft';
import HeaderRight from '@/themeBasedComponents/ios/headerRight';

/** ios 可替换组件 */
export const defaultIOSComponents: ThemeBasedComponentRecord = {
  HeaderLeft: HeaderLeft,
  HeaderCenter: HeaderCenter,
  HeaderRight: HeaderRight,
  CourseItem: CourseItem,
};
