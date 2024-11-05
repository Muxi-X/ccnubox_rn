import React, { ReactElement } from 'react';
import { ViewProps } from 'react-native';

export interface ModalProps {
  /* 控制Modal是否显示 */
  visible?: boolean;
  /* 关闭Modal */
  onClose?: () => void;
  children?: React.ReactNode;
  /* 是否具有title，不填则没有 */
  title?: React.ReactNode;
  /* 点击确认 */
  onConfirm?: () => void;
  /* 点击取消 */
  onCancel?: () => void;
  /* 取消文字 */
  cancelText?: string;
  /* 确认文字 */
  confirmText?: string;
  /* 是否显示取消按钮 */
  showCancel?: boolean;
  /* modal 类型 */
  mode?: 'bottom' | 'middle';
  show?: () => void;
}

export interface ModalTriggerProps
  extends ViewProps,
    Omit<ModalProps, 'visible'> {
  onPress?: () => void;
  triggerComponent?: ReactElement;
}
