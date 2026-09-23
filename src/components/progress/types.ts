import { ReactNode } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface ProgressProps {
  /** 进度百分比 0-100 */
  percent: number;
  /** 进度条类型：circle 圆形 | line 线形 */
  type?: 'circle' | 'line';
  /** 圆形进度条的尺寸（直径），默认 80 */
  size?: number;
  /** 进度条宽度，默认 6 */
  strokeWidth?: number;
  /** 进度条颜色，默认紫色 #7B71F1 */
  strokeColor?: string;
  /** 轨道颜色（未完成部分），默认 #E1E2F1 */
  trailColor?: string;
  /** 是否显示进度文字，默认 true */
  showText?: boolean;
  /**
   * 自定义进度文字格式化函数
   * @param percent 当前进度百分比
   * @returns 返回要显示的内容（字符串或 ReactNode）
   */
  format?: (percent: number) => string | ReactNode;
  /** 进度文字样式 */
  textStyle?: StyleProp<TextStyle>;
  /** 容器样式 */
  style?: StyleProp<ViewStyle>;
  /** 是否使用主题色（跟随深浅色模式），默认 false */
  useTheme?: boolean;
}
