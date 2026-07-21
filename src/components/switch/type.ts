import { StyleProp, ViewStyle } from 'react-native';

export interface SwitchProps {
  //是否选中
  checked?: boolean;
  //切换状态回回调函数
  onChange?: (checked: boolean) => void;
  //开关外容器样式
  style?: StyleProp<ViewStyle>;
  //是否禁用开关
  disabled?: boolean;
  //开关轨道（长条那个）颜色
  trackColor?: { false: string; true: string };
  // 开关滑块（小圆点）颜色
  thumbColor?: string;
}
