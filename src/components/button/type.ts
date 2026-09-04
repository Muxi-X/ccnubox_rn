import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ButtonProps as RNEButtonProps } from '@rneui/themed';

/**
 * 按钮分级规范
 * - Primary: 最高级，圆角20，默认字号20，默认字间距15%
 * - Secondary: 第二级，圆角15，默认字号20，默认字间距10%
 * - Round: 第三级，圆角30，默认字号20，默认字间距5%
 */
export type ButtonHierarchy = 'Primary' | 'Secondary' | 'Round';

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
  >
> {
  /**
   * 按钮分级类型（Primary / Secondary / Round）
   * @default 'Primary'
   */
  type?: ButtonHierarchy;

  /**
   * 是否为白色样式按钮（如特定纯色背景页面），布尔值判断
   * @default false
   */
  isWhite?: boolean;
  white?: boolean;

  /**
   * 自定义背景颜色（优先级高于主题和 isWhite）
   */
  backgroundColor?: string;

  /**
   * 自定义文字颜色（优先级高于主题和 isWhite）
   */
  textColor?: string;

  /**
   * 自定义字体大小（字号，未提供时由分级规范默认决定）
   */
  fontSize?: number;

  /**
   * 自定义宽度（未设置时自适应或遵循外层/分级样式）
   */
  width?: number | string;

  /**
   * 外边距上边距
   */
  marginTop?: number | string;

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
  text_style?: StyleProp<TextStyle>;

  /**
   * button 外层容器样式
   */
  style?: StyleProp<ViewStyle>;

  /**
   * button 本身样式
   */
  buttonStyle?: StyleProp<ViewStyle>;

  onPress?: () => void;

  disabled?: boolean;
}
