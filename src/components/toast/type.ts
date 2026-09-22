import type { ReactNode } from 'react';

import { PortalBaseProps } from '@/components/portal';

export type ToastIconType = 'success' | 'fail' | 'info' | 'loading';

export interface ToastProps extends PortalBaseProps {
  /* icon 类型或自定义图标节点 */
  icon?: ToastIconType | ReactNode;
  /* toast 文字 */
  text?: string;
  /* 持续时间(毫秒或秒)，默认 2000ms */
  duration?: number;
  /* 关闭回调 */
  onClose?: () => void;
}
