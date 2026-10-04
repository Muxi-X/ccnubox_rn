import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { PortalBaseProps } from '@/components/portal';

export interface DialogProps extends PortalBaseProps {
  /* 是否可见 */
  isVisible?: boolean;
  /* 弹窗标题 */
  title?: string | ReactNode;
  /* 正文说明（也可以作为 children 传入） */
  message?: string | ReactNode;
  children?: ReactNode;
  /* 确认按钮文字，默认“确定”，传 null 或 false 则不显示 */
  confirmText?: string | null | false;
  /* 取消按钮文字，默认“取消”，传 null 或 false 则不显示 */
  cancelText?: string | null | false;
  /* 确认回调 */
  onConfirm?: () => void | Promise<void>;
  /* 取消回调 */
  onCancel?: () => void;
  /* 点击背景遮罩关闭 */
  onBackdropPress?: () => void;
  /* 弹窗容器自定义样式 */
  containerStyle?: StyleProp<ViewStyle>;
  /* 标题自定义样式 */
  titleStyle?: StyleProp<TextStyle>;
  /* 正文自定义样式 */
  messageStyle?: StyleProp<TextStyle>;
  /* 是否显示加载中状态 */
  isLoading?: boolean;
}

export interface DialogAlertOptions {
  title?: string | ReactNode;
  message?: string | ReactNode;
  children?: ReactNode;
  confirmText?: string;
  onConfirm?: () => void | Promise<void>;
  onBackdropPress?: () => void;
}

export interface DialogConfirmOptions extends DialogAlertOptions {
  cancelText?: string;
  onCancel?: () => void;
}
