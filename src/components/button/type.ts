import { ButtonProps as RNEButtonProps } from '@rneui/themed';
import {
  PressableAndroidRippleConfig,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

/**
 * 按钮分级规范
 * - Primary: 最高级，圆角20，默认字间距15%
 * - Secondary: 第二级，圆角15，默认字间距10%
 * - Round: 第三级，圆角30，默认字间距5%
 * - ghost: 幽灵按钮，透明背景，无内边距/外层包裹，用于轻量级文字或图标操作
 */
export type ButtonHierarchy = 'Primary' | 'Secondary' | 'Round' | 'ghost';

// omit 排除不支持或被内部接管的 props
export interface ButtonProps extends Partial<
  Omit<
    RNEButtonProps,
    | 'title'
    | 'titleStyle'
    | 'loading'
    | 'buttonStyle'
    | 'containerStyle'
    | 'type'
    | 'android_ripple'
  >
> {
  /**
   * 按钮分级类型（Primary / Secondary / Round / ghost）
   * @default 'Primary'
   */
  type?: ButtonHierarchy;

  /**
   * Android 原生水波纹配置（ghost 默认无水波纹，其他类型默认开启；传 null 显式禁用）
   */
  android_ripple?: PressableAndroidRippleConfig | null;

  /**
   * 字间距，支持百分比字符串（如 '15%'、'10%'）或数字像素值
   * 默认标准为 15%（根据分级自适应：Primary 默认 15%，Secondary 默认 10%，Round 默认 5%）
   */
  letterSpacing?: number | `${number}%` | string;

  /**
   * 是否在加载中
   */
  isLoading?: boolean;

  /**
   * button 里展示的内容
   */
  children?: React.ReactNode;

  /**
   * 文字样式
   */
  textStyle?: StyleProp<TextStyle>;

  /**
   * button 外层容器样式（用于设置 width, height, margin 等容器与布局属性）
   */
  style?: StyleProp<ViewStyle>;

  /**
   * button 本身样式（用于设置 backgroundColor, borderRadius, padding 等按钮本体属性）
   */
  buttonStyle?: StyleProp<ViewStyle>;
}
