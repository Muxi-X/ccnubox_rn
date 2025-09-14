import { Action } from '@ant-design/react-native/lib/tooltip';
import { StyleSheet, Text, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import AddCourseIcon from '@/assets/icons/calendar/add-course.svg';
import ScreenShotIcon from '@/assets/icons/calendar/screenshot.svg';
import globalEventBus from '@/utils/eventBus';

import { commonColors } from '../styles/common';

import { SinglePageType } from '@/types/tabBarTypes';

export const courseTableApplications: Omit<
  Omit<SinglePageType, 'iconName'>,
  'headerLeft'
>[] = [
  {
    title: '添加课程',
    name: 'addCourse',
  },
  {
    title: '添加测试',
    name: 'addTest',
  },
  {
    title: '编辑课程',
    name: 'editCourse',
  },
];
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

export const tooltipActions: Action[] = [
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
