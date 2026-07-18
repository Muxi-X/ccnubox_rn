import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface ButtonProps {
  /**
   * 是否在加载中
   */
  isLoading?: boolean;
  /**
   * button 里展示的内容
   */
  children?: string;
  /**
   * 文字样式
   */
  text_style?: StyleProp<TextStyle>;

  style?: StyleProp<ViewStyle>;

  onPress?: () => void;

  disabled?: boolean;
}
