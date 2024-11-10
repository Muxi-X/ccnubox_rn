import { ThemeBasedComponentRecord } from '@/store/types';
import HeaderCenter from '@/themeBasedComponents/ios/headerCenter';
import HeaderLeft from '@/themeBasedComponents/ios/headerLeft';

/** ios 可替换组件 */
export const defaultIOSComponents: ThemeBasedComponentRecord = {
  header_left: HeaderLeft,
  header_center: HeaderCenter,
};
