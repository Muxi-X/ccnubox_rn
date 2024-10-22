import { Text } from 'react-native';

import { SingleTabType } from '@/types/tabBarTypes';
import { Icon } from '@ant-design/react-native';
import { commonStyles } from '@/styles/common';

/**
 * @enum tabBar颜色
 * @description PRIMARY 为默认
 */
export const TABBAR_COLOR = {
  PRIMARY: '#a0a0a0',
};
/** 导航栏配置 */
export const tabConfig: SingleTabType[] = [
  {
    name: 'index',
    title: '',
    iconName: 'home',
    headerLeft: () => (
      <Text style={[commonStyles.TabBarPadding, commonStyles.fontLarge]}>
        华师匣子
      </Text>
    ),
    headerRight: () => (
      <Icon name="menu" style={commonStyles.TabBarPadding}></Icon>
    ),
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
