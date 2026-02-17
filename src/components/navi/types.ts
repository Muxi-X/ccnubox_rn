import { GestureResponderEvent } from 'react-native';

import { icons } from './TabBarIcon';

import { SinglePageType } from '@/types/tabBarTypes';

export interface TabBarItemProps extends SinglePageType {
  /**
   * 是否为当前选中
   */
  isFocused: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  iconName?: keyof typeof icons;
  /**
   * 展示文本
   */
  label?: string;
}
