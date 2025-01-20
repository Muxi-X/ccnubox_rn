import { Tooltip } from '@ant-design/react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, TouchableOpacity, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { commonColors, commonStyles } from '@/styles/common';

import { SinglePageType } from '@/types/tabBarTypes';
import { tooltipActions } from './courseTableApplications';
import { Href, router } from 'expo-router';

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
      ></MaterialIcons>
    ),
  },
  {
    name: 'schedule',
    title: '日程',
    iconName: 'calendar',
    headerTitle: () => (
      <>
        <TouchableOpacity
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            console.log('选择周次');
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
            第1周
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
          ]}
        >
          当前周设置为1
        </Text>
      </>
    ),
    headerRight: () => (
      <>
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
          ></MaterialIcons>
          <View>
            <Tooltip.Menu
              actions={tooltipActions}
              // content={<TooltipContent />}
              placement="bottom-start"
              onAction={node => {
                // 根据 key 跳转,如果 key 不是路径, 则执行其他操作
                if ((node.key as string)[0] === '/')
                  router.navigate(node.key as Href);
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
                ></MaterialIcons>
              </TouchableOpacity>
            </Tooltip.Menu>
          </View>
        </View>
      </>
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
