import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text } from 'react-native';

import { commonColors, commonStyles } from '@/styles/common';
import { SingleTabType } from '@/types/tabBarTypes';

/**
 * @enum tabBar颜色
 * @description PRIMARY 为默认
 */
export const TABBAR_COLOR = {
  PRIMARY: commonColors.darkGray,
};
/** 导航栏配置 */
export const tabConfig: SingleTabType[] = [
  {
    name: 'index',
    title: '首页',
    iconName: 'home',
    headerTitle: () => <></>,
    headerLeft: () => (
      <Text style={[commonStyles.TabBarPadding, commonStyles.fontLarge]}>
        华师匣子
      </Text>
    ),
    headerRight: () => (
      <MaterialIcons
        name="menu"
        style={commonStyles.TabBarPadding}
      ></MaterialIcons>
    ),
  },
  {
    name: 'schedule',
    title: '日程',
    iconName: 'calendar',
    headerTitle: () => (
      <Text style={[commonStyles.TabBarPadding, commonStyles.fontLarge]}> 日程 </Text>
    ),
    headerRight: () => (
      <MaterialIcons
        name="menu"
        style={commonStyles.TabBarPadding}
        ></MaterialIcons>
    ),
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
