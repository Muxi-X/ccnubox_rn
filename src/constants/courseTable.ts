/**
 * 课程宽度
 */
import { Dimensions } from 'react-native';

import { percent2px } from '@/utils/percent2px';

const windowWidth = Dimensions.get('window').width;
export const COURSE_ITEM_WIDTH = (windowWidth - 50) / 5;
/**
 * 课表头高度
 */
export const COURSE_HEADER_HEIGHT = 40;
/**
 * 课程高度
 */
export const COURSE_ITEM_HEIGHT = percent2px(8, 'height');
/**
 * 时间栏宽度（高度和课程一样）
 */
export const TIME_WIDTH = percent2px(16);
/**
 * 一周天数
 */
export const daysOfWeek = ['一', '二', '三', '四', '五', '六', '日'];
/**
 * 每隔几个时间格出现下划线
 */
export const courseCollapse = 2;
/**
 * 时间段
 */
export const timeSlots = [
  '08:00',
  '',
  '10:10',
  '',
  '14:00',
  '',
  '16:10',
  '',
  '18:30',
  '',
  '20:15',
  '',
];

/**
 * 颜色选项
 */
export const colorOptions = [
  {
    color: '#9B86FD',
    label: '一',
  },
  {
    color: '#B8CBFF',
    label: '二',
  },
  {
    color: '#B8A6F5',
    label: '三',
  },
  {
    color: '#F3D27E',
    label: '四',
  },
  {
    color: '#F39FA7',
    label: '五',
  },
  // Todo:周六周日课表的颜色
  {
    color: '#F39FA7',
    label: '六',
  },
  {
    color: '#F39FA7',
    label: '日',
  },
  {
    color: '#808080',
    label: '无',
  },
];

/**
 * 由于内容为 absolute定位，因此内容 padding 在这定义
 */

export const COURSE_HORIZONTAL_PADDING = 4;
export const COURSE_VERTICAL_PADDING = 4;
