import { SinglePageType } from '@/types/tabBarTypes';

export interface TabBarItemProps extends SinglePageType {
  /**
   * 是否为当前选中
   */
  isFocused: boolean;
  onPress?: (e: any) => void;
  onLongPress?: (e: any) => void;
  /**
   * 展示文本
   */
  label?: string;
}
