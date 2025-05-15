import { PortalBaseProps } from '@/components/portal';

export interface ToastProps extends PortalBaseProps {
  /* 是否可见 */
  visible?: boolean;
  /* icon 类型 */
  icon?: 'success' | 'fail';
  /* toast文字 */
  text?: string;
  /* 持续时间(毫秒)，默认2000ms 不要小于400ms 要不然动画会被爆掉 */
  duration?: number;
}
