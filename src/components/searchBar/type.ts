import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface SearchBarProps {
  // 当前输入框的值
  value: string;
  // 输入内容变化回调
  onChange: (text: string) => void;
  // 提交搜索时的回调
  onSubmit?: () => void;
  // 输入框的占位提示文字
  placeholder?: string;
  // 搜索条容器的自定义样式
  containerStyle?: StyleProp<ViewStyle>;
  // 输入框文本的自定义样式
  inputStyle?: StyleProp<TextStyle>;
  // 搜索图标和清除按钮图标的颜色
  iconColor?: string;
  // 输入框占位文字颜色
  placeholderTextColor?: string;
}
