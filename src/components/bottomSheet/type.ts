import type { ReactNode } from 'react';
import type {
  ScrollViewProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { ButtonHierarchy } from '@/components/button';
import { PortalBaseProps } from '@/components/portal';

export interface BottomSheetProps extends PortalBaseProps {
  /* 是否可见 */
  isVisible?: boolean;
  /* 标题 */
  title?: string | ReactNode;
  /* 子节点内容 */
  children?: ReactNode;
  /* 点击背景遮罩关闭 */
  onBackdropPress?: () => void;
  /* 取消回调 */
  onCancel?: () => void;
  /* 确定回调 */
  onConfirm?: () => void;
  /* 关闭回调 */
  onClose?: () => void;
  /* 确认按钮文案，传 false 则不显示 */
  confirmText?: string | false;
  /* 取消按钮文案，传 false 则不显示 */
  cancelText?: string | false;
  /* 是否显示操作按钮 */
  showButtons?: boolean;
  /* 是否显示取消按钮（兼容旧 Modal 参数） */
  showCancel?: boolean;
  /* 按钮分级类型 */
  buttonType?: ButtonHierarchy;
  /* 外层容器自定义样式 */
  containerStyle?: StyleProp<ViewStyle>;
  /* 遮罩背景样式 */
  backdropStyle?: StyleProp<ViewStyle>;
  /* 内容卡片自定义样式 */
  contentStyle?: StyleProp<ViewStyle>;
  /* 标题样式 */
  titleStyle?: StyleProp<TextStyle>;
  /* 是否显示顶部拖拽小横条，默认 true */
  showHandle?: boolean;
  /* ScrollView 属性 */
  scrollViewProps?: ScrollViewProps;
}

export interface BottomSheetTriggerProps extends Omit<
  BottomSheetProps,
  'isVisible'
> {
  triggerComponent?: ReactNode;
  style?: StyleProp<ViewStyle>;
}
