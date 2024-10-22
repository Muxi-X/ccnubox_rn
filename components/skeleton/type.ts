import { ReactElement, ReactNode } from 'react';
import { TextStyle, ViewStyle } from 'react-native';

/**
 * Skeleton 类型
 */
export interface SkeletonType {
  style?: ViewStyle | TextStyle;
  children?: ReactElement;
  loading?: boolean;
}

/**
 * SkeletonView 类型，用于给所有 children 加上 Skeleton
 */
export interface SkeletonViewType extends Omit<SkeletonType, 'children'> {
  children: ReactNode;
}
