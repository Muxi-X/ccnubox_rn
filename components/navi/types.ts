import { SingleTabType } from '@/app/(tabs)/types';

export interface TabBarItemProps extends SingleTabType {
  /**
   * 是否为当前选中
   */
  isFocused: boolean;
  onPress?: (e: any) => void;
  onLongPress?: (e: any) => void;
  /**
   * 按钮颜色
   */
  color?: string;
  /**
   * 展示文本
   */
  label?: string;
}
