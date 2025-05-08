import { StyleProp, TextStyle } from 'react-native';
import { RectButtonProps } from 'react-native-gesture-handler';

export interface ButtonProps extends RectButtonProps {
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
}
