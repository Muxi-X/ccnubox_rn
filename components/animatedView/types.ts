import { ReactElement } from 'react';
import { ViewProps } from 'react-native';

export interface BaseAnimatedProps extends ViewProps {
  /**
   * 是否触发动画
   */
  trigger?: boolean;
  /**
   * 应用动画的组件
   */
  children: ReactElement;
  /**
   * 动画时长
   */
  duration?: number;
}

export interface ScaleAnimationProps extends BaseAnimatedProps {
  outputRange?: [number, number];
}
