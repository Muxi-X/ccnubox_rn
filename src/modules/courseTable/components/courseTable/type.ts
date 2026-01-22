import { ReactElement, ReactNode } from 'react';
import { ViewProps } from 'react-native';
import {
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { StyleProps } from 'react-native-reanimated';
export type courseType = {
  class_when: string;
  classname: string;
  credit: number;
  day: number;
  id: string;
  semester: string;
  teacher: string;
  week_duration: string;
  weeks: number[];
  where: string;
  year: string;
  note?: string; // 添加 note 字段
  is_official: boolean; // 是否为教务系统课程
};

export interface CourseTableProps {
  data: courseType[];
  currentWeek: number;
  onTimetableRefresh: (_forceRefresh: boolean) => Promise<void>;
}

// 课程中间类型,比 courseType 增加 rowIndex 和 colIndex
export interface CourseTransferType {
  id: string;
  courseName: string;
  teacher: string;
  classroom: string;
  timeSpan: number;
  rowIndex: number;
  colIndex: number;
  date: string;
  isThisWeek: boolean;
  week_duration: string;
  credit: number;
  class_when: string;
  weeks: number[]; // 添加 weeks 字段
  note?: string; // 添加 note 字段
  is_official: boolean; // 是否为教务系统课程
}

export interface WeekSelectorProps {
  currentWeek: number;
  showWeekPicker: boolean;
  onWeekSelect: (_week: number) => void;
}

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
  children?: ReactElement<ViewProps>;
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
   * 背景层，会随内容一起滚动
   */
  backgroundLayer?: ReactNode;
  /**
   * 下拉刷新背景颜色
   */
  refreshBackgroundColor?: string;
  /**
   * 是否可折叠
   */
  collapsable?: boolean;
  /**
   * 是否启用滚动
   */
  enableScrolling?: boolean;
}
