import { PortalBaseProps } from '@/components/portal';

export interface ToastProps extends PortalBaseProps {
  /* 是否可见 */
  visible?: boolean;
  /* icon 类型 */
  icon?: string;
}
