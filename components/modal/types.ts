import React from 'react';

export interface BottomModalProps {
  /* 控制Modal是否显示 */
  visible: boolean;
  /* 关闭Modal */
  onClose?: () => void;
  children?: React.ReactNode;
  /* 是否具有title，不填则没有 */
  title?: React.ReactNode;
  /* 点击确认 */
  onConfirm?: () => void;
  /* 点击取消 */
  onCancel?: () => void;
}
