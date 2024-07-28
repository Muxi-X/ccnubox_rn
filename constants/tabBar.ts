import { SingleTabType } from '@/app/(tabs)/types';
/**
 * @enum tabBar颜色
 * @description PRIMARY 为默认
 * @description ACTIVE 为选中
 */
export const TABBAR_COLOR = {
  PRIMARY: '#a0a0a0',
  ACTIVE: '#ffbb40',
};
/** 导航栏配置 */
export const tabConfig: SingleTabType[] = [
  {
    name: 'index',
    title: '首页',
    iconName: 'home',
  },
  {
    name: 'schedule',
    title: '日程',
    iconName: 'calendar',
  },
  {
    name: 'notification',
    title: '通知',
    iconName: 'notification',
  },
  {
    name: 'setting',
    title: '其他',
    iconName: 'setting',
  },
];
