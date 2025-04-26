import { ReactElement, ReactNode } from 'react';
import {
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { StyleProps } from 'react-native-reanimated';

/**
 * ScrollViewProps
 * 全向滚动的 ScrollView
 */
export interface ScrollableViewProps {
  /**
   * 滚动监听
   * @param evt
   */
  onScroll?: (_evt: GestureUpdateEvent<PanGestureHandlerEventPayload>) => void;
  /**
   * 滚动到最上端监听
   */
  onScrollToTop?: () => void;
  /**
   * 滚动到最下端监听
   */
  onScrollToBottom?: () => void;
  /**
   * 滚动内容
   */
  children?: ReactElement;
  /**
   * 下方固定栏彩蛋
   */
  stickyBottom?: ReactNode;
  /**
   * 左侧固定栏
   */
  stickyLeft?: ReactNode;
  /**
   * 上方固定栏
   */
  stickyTop?: ReactNode;
  /**
   * 下拉刷新操作
   */
  onRefresh?: (
    /** 刷新失败与否 callback */
    _handleSuccess: () => void,
    _handleFail: () => void
  ) => void;
  /**
   * 样式
   */
  style?: StyleProps;
  /**
   * 左上角样式
   */
  cornerStyle?: StyleProps;
  /**
   * 是否可折叠
   */
  collapsable?: boolean;
  /**
   * 是否启用滚动
   */
  enableScrolling?: boolean;
}
