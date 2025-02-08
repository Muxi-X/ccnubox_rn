import { ReactElement, ReactNode } from 'react';
import { TextStyle, ViewStyle } from 'react-native';

/**
 * Skeleton 类型
 */
export interface SkeletonType {
  style?: ViewStyle | TextStyle;
  children?: ReactElement;
  loading?: boolean;
  /* 钉死的宽度，如果组件是动态宽度的就钉死 */
  width?: number;
  /* 钉死的高度 */
  height?: number;
}

/**
 * SkeletonView 类型，用于给所有 children 加上 Skeleton
 */
export interface SkeletonViewType extends Omit<SkeletonType, 'children'> {
  children: ReactNode;
}
