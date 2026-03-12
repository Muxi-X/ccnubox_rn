// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import {
  ScheduleHeaderRight,
  ScheduleHeaderTitle,
} from '@/modules/courseTable/components/ScheduleHeaders';
//import NotificationHeaderRight from '@/modules/notification/component/NotiNavbar';
import NotificationHeaderRight from '@/modules/notification/component/NotiNavbar';
import { commonColors, commonStyles } from '@/styles/common';

import type { SinglePageType } from '@/types/tabBarTypes';

/**
 * @enum tabBar颜色
 * @description PRIMARY 为默认
 */
export const TABBAR_COLOR = {
  PRIMARY: commonColors.darkGray,
};

/** 导航栏配置 */
export const TABS: SinglePageType[] = [
  {
    name: 'index',
    title: '首页',
    iconName: 'home',
    headerTitle: () => <></>,
    headerLeft: () => (
      <Text
        style={[
          commonStyles.TabBarPadding,
          commonStyles.fontLarge,
          useVisualScheme.getState().currentStyle?.header_text_style,
        ]}
      >
        华师匣子
      </Text>
    ),
    // headerRight: () => (
    //   <MaterialIcons
    //     name="menu"
    //     size={24}
    //     style={[
    //       commonStyles.TabBarPadding,
    //       useVisualScheme.getState().currentStyle?.header_text_style,
    //     ]}
    //   />
    // ),
  },
  {
    name: 'schedule',
    title: '日程',
    iconName: 'calendar',
    headerTitle: () => <ScheduleHeaderTitle />,
    headerRight: () => <ScheduleHeaderRight />,
  },
  {
    name: 'notification',
    title: '通知',
    iconName: 'notification',
    headerTitle: () => <></>,
    headerLeft: () => (
      <Text
        style={[
          commonStyles.fontLarge,
          commonStyles.fontBold,
          commonStyles.TabBarPadding,
          {
            lineHeight: 30,
            height: 30,
          },
          useVisualScheme.getState().currentStyle?.header_text_style,
        ]}
      >
        消息通知
      </Text>
    ),
    headerRight: () => <NotificationHeaderRight />,
  },
  {
    name: 'setting',
    title: '其他',
    iconName: 'setting',
    headerTitle: () => (
      <Text
        style={[
          commonStyles.fontLarge,
          useVisualScheme.getState().currentStyle?.header_text_style,
        ]}
      >
        其他
      </Text>
    ),
  },
];
