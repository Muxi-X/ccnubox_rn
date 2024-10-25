import { ReactNode } from 'react';
import {
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

export interface ScrollableViewProps {
  onScroll?: (evt: GestureUpdateEvent<PanGestureHandlerEventPayload>) => void;
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
  children?: ReactNode;
  stickyLeft?: ReactNode;
  stickyTop?: ReactNode;
}
