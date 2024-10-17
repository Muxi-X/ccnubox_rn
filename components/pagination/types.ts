import { TextStyle, ViewStyle } from 'react-native';

export interface PaginationType {
  /**
   * 总页数
   */
  totalPages: number;
  /**
   * 当前页数
   */
  currentPage: number;
  /**
   * pagination 切换时回调
   */
  onChange?: (current: number) => void;
  /**
   * dot 颜色
   * common: 普通样式
   * active: 激活样式
   * both: 普通、激活通用样式
   */
  styles?: Partial<Record<'common' | 'active' | 'both', ViewStyle | TextStyle>>;
}
