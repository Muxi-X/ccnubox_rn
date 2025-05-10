// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as React from 'react';
import { Text } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import {
  ScheduleHeaderRight,
  ScheduleHeaderTitle,
} from '@/app/(courseTable)/components/ScheduleHeader';
//import NotificationHeaderRight from '@/modules/notification/component/NotiNavbar';
import { commonColors, commonStyles } from '@/styles/common';

import { SinglePageType } from '@/types/tabBarTypes';

/**
 * @enum tabBar颜色
 * @description PRIMARY 为默认
 */
export const TABBAR_COLOR = {
  PRIMARY: commonColors.darkGray,
};

/** 导航栏配置 */
export const tabConfig: SinglePageType[] = [
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
    name: 'setting',
    title: '其他',
    iconName: 'setting',
  },
  // {
  //   name: 'notification',
  //   title: '通知',
  //   iconName: 'notification',
  //   headerTitle: () => <></>,
  //   headerLeft: () => (
  //     <Text
  //       style={[
  //         commonStyles.fontLarge,
  //         commonStyles.fontBold,
  //         commonStyles.TabBarPadding,
  //         {
  //           lineHeight: 30,
  //           height: 30,
  //         },
  //         useVisualScheme.getState().currentStyle?.header_text_style,
  //       ]}
  //     >
  //       消息通知
  //     </Text>
  //   ),
  //   headerRight: () => <NotificationHeaderRight />,
  // },
];
