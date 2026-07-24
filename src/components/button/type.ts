import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ButtonProps as RNEButtonProps } from '@rneui/themed';

//omit 排除不支持的props
export interface ButtonProps extends Partial<
  Omit<
    RNEButtonProps,
    'title' | 'titleStyle' | 'loading' | 'buttonStyle' | 'containerStyle'
  >
> {
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
  //button外层样式
  style?: StyleProp<ViewStyle>;
  //button本身样式
  buttonStyle?: StyleProp<ViewStyle>;

  onPress?: () => void;

  disabled?: boolean;
}
