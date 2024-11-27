import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

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
      <View style={styles.headerContainer}>
        <View style={styles.centerAlign}>
          {/* 主标题 */}
          <View style={styles.titleWithAfter}>
            <Text style={[commonStyles.fontLarge, styles.boldText]}>第1周</Text>
            <Text style={styles.afterText}>{'>'}</Text>
          </View>
          {/* 副标题 */}
          <Text style={commonStyles.fontSmall}>当前周设置为1</Text>
        </View>
      </View>
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

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    left: '50%',
  },
  centerAlign: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  titleWithAfter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  afterText: {
    transform: [{ rotate: '90deg' }],
    width: 10,
    fontSize: 14,
    marginLeft: 4,
  },
});
