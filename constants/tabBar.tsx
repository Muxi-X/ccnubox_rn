import { Tooltip } from '@ant-design/react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href, router } from 'expo-router';
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';
import useWeekStore from '@/store/weekStore';

import NotificationHeaderRight from '@/module/notification/component/NotiNavbar';
import { commonColors, commonStyles } from '@/styles/common';

import { tooltipActions } from './courseTableApplications';

import { SinglePageType } from '@/types/tabBarTypes';

const ScheduleHeader: React.FC = () => {
  // const [showWeekPicker, setShowWeekPicker] = React.useState(false);
  const { currentWeek, showWeekPicker, setShowWeekPicker } = useWeekStore();

  return (
    <>
      <View style={{ width: '100%' }}>
        <TouchableOpacity
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            // console.log('选择周次');
            // setShowWeekPicker(!showWeekPicker);
            setShowWeekPicker(!showWeekPicker);
          }}
        >
          <Text
            style={[
              commonStyles.fontLarge,
              useVisualScheme.getState().currentStyle?.header_text_style,
              {
                textAlign: 'center',
              },
            ]}
          >
            第{currentWeek}周
          </Text>
          <MaterialIcons
            name="arrow-forward-ios"
            size={20}
            style={[
              useVisualScheme.getState().currentStyle?.header_text_style,
              {
                transform: [{ rotate: '90deg' }],
                marginLeft: 4,
              },
            ]}
          />
        </TouchableOpacity>
        <Text
          style={[
            commonStyles.fontLight,
            commonStyles.fontSmall,
            useVisualScheme.getState().currentStyle?.schedule_week_text_style,
            {
              textAlign: 'center',
            },
          ]}
        >
          当前周设置为{currentWeek}
        </Text>
      </View>
    </>
  );
};

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
    headerRight: () => (
      <MaterialIcons
        name="menu"
        size={24}
        style={[
          commonStyles.TabBarPadding,
          useVisualScheme.getState().currentStyle?.header_text_style,
        ]}
      />
    ),
  },
  {
    name: 'schedule',
    title: '日程',
    iconName: 'calendar',
    headerTitle: () => <ScheduleHeader />,
    headerRight: () => (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <MaterialIcons
          name="delete-sweep"
          size={24}
          style={[
            useVisualScheme.getState().currentStyle?.header_text_style,
            {
              paddingRight: 10,
            },
          ]}
        />
        <View>
          <Tooltip.Menu
            actions={tooltipActions}
            placement="bottom-start"
            onAction={node => {
              if ((node.key as string)[0] === '/') {
                router.navigate(node.key as Href);
              }
            }}
            styles={{
              tooltip: {
                width: 160,
              },
            }}
            trigger="onPress"
          >
            <TouchableOpacity>
              <MaterialIcons
                name="add"
                size={24}
                style={[
                  useVisualScheme.getState().currentStyle?.header_text_style,
                  {
                    paddingRight: 10,
                  },
                ]}
              />
            </TouchableOpacity>
          </Tooltip.Menu>
        </View>
      </View>
    ),
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
  },
];
