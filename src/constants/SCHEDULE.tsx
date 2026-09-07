/**
 * 课程宽度
 */
import { Action } from '@ant-design/react-native/lib/tooltip';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import { courseTableIcons } from '@/assets/icons';
import useVisualScheme from '@/store/visualScheme';
import { SinglePageType } from '@/types/tabBarTypes';
import globalEventBus from '@/utils/eventBus';
import { percent2px } from '@/utils/percent2px';

import { commonColors } from '../styles/common';

export { DAYS_OF_WEEK, TIME_SLOTS } from '@/modules/courseTable/constants';

const TextNode: React.FC<{ text: string }> = ({ text }) => {
  const currentScheme = useVisualScheme(state => state.currentStyle);
  return (
    <View style={styles.tooltipItem}>
      <Text style={[styles.tooltipText, currentScheme?.text_style]}>
        {text}
      </Text>
    </View>
  );
};

const AddCourseIcon = courseTableIcons.addCourse;
const ScreenShotIcon = courseTableIcons.screenshot;

const styles = StyleSheet.create({
  tooltipImage: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  tooltipText: {
    fontSize: 10,
  },
  tooltipItem: {
    flex: 1,
    width: 160,
    justifyContent: 'center',
  },
});

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
export const TIME_WIDTH = percent2px(12);
/**
 * 每隔几个时间格出现下划线
 */
export const COURSE_COLLAPSE = 2;
/**
 * 颜色选项
 */
export const ITEM_COLORS = [
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
  // Todo)):周六周日课表的颜色
  {
    color: '#F39FA7',
    label: '六',
  },
  {
    color: '#F39FA7',
    label: '日',
  },
  {
    color: '#989AA8',
    label: '无',
  },
];

/**
 * 由于内容为 absolute定位，因此内容 padding 在这定义
 */

export const COURSE_HORIZONTAL_PADDING = 4;
export const COURSE_VERTICAL_PADDING = 4;

export const SCHEDULE_PAGES: Omit<
  Omit<SinglePageType, 'iconName'>,
  'headerLeft'
>[] = [
  {
    title: '添加课程',
    name: 'addCourse',
  },
  {
    title: '编辑课程',
    name: 'editCourse',
  },
];

export const SCHEDULE_ACTIONS: Action[] = [
  {
    key: '/(courseTable)/addCourse',
    icon: <AddCourseIcon color={commonColors.purple} width={24} />,
    text: <TextNode text="添加新课程" />,
  },
  // {
  //   key: '/(courseTable)/addTest',
  //   icon: (
  //     <Image
  //       style={styles.tooltipImage}
  //       source={require('@/assets/images/add-test.png')}
  //     />
  //   ),
  //   text: <TextNode text="添加考试安排" />,
  // },
  {
    icon: <ScreenShotIcon color={commonColors.purple} width={24} />,
    text: <TextNode text="课表截图" />,
    onPress: () => {
      globalEventBus.emit('SaveImageShot');
    },
  },
  // {
  //   key: 'changeYear',
  //   icon: (
  //     <Image
  //       style={styles.tooltipImage}
  //       source={require('@/assets/images/change-year.png')}
  //     />
  //   ),
  //   text: <TextNode text="切换学年" />,
  // },
];
