import { SinglePageType } from '@/types/tabBarTypes';

export interface TabBarItemProps extends SinglePageType {
  /**
   * 是否为当前选中
   */
  isFocused: boolean;
  onPress?: (_e: any) => void;
  onLongPress?: (_e: any) => void;
  iconName?: string;
  /**
   * 展示文本
   */
  label?: string;
}
