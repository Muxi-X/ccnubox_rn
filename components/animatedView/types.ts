import { ReactNode } from 'react';
import { ViewProps, ViewStyle } from 'react-native';

export interface BaseAnimatedProps extends ViewProps {
  /**
   * 是否触发动画
   */
  trigger?: boolean;
  /**
   * 应用动画的组件
   */
  children: ReactNode;
  /**
   * 动画时长
   */
  duration?: number;
  /**
   * 延迟
   */
  delay?: number;
  /**
   * 动画结束监听
   */
  onAnimationEnd?: () => void;
}

export interface ScaleAnimationProps extends BaseAnimatedProps {
  outputRange?: [number, number];
}

export interface OpacityAnimationProps extends BaseAnimatedProps {
  /** 由不可见变可见或是相反 */
  toVisible?: boolean;
}

export interface FadeAnimationProps extends BaseAnimatedProps {
  /** 动画距离 */
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  toVisible?: boolean;
}

export interface SlideInProps extends BaseAnimatedProps {
  style?: ViewStyle;
  direction?: 'vertical' | 'vertical-reverse';
  distance?: number;
}
