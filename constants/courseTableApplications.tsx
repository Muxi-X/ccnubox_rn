import { Action } from '@ant-design/react-native/lib/tooltip';
import { Image, StyleSheet, Text, View } from 'react-native';

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
    color: '#333',
  },
  tooltipItem: {
    flex: 1,
    width: 160,
    justifyContent: 'center',
  },
});

const TextNode: React.FC<{ text: string }> = ({ text }) => {
  return (
    <View style={styles.tooltipItem}>
      <Text style={styles.tooltipText}>{text}</Text>
    </View>
  );
};

export const tooltipActions: Action[] = [
  {
    key: '/(courseTable)/addCourse',
    icon: (
      <Image
        style={styles.tooltipImage}
        source={require('@/assets/images/add-course.png')}
      />
    ),
    text: <TextNode text="添加新课程" />,
  },
  {
    key: '/(courseTable)/addTest',
    icon: (
      <Image
        style={styles.tooltipImage}
        source={require('@/assets/images/add-test.png')}
      />
    ),
    text: <TextNode text="添加考试安排" />,
  },
  {
    key: 'changeWeek',
    icon: (
      <Image
        style={styles.tooltipImage}
        source={require('@/assets/images/change-week.png')}
      />
    ),
    text: <TextNode text="切换当前周" />,
  },
  {
    key: 'changeYear',
    icon: (
      <Image
        style={styles.tooltipImage}
        source={require('@/assets/images/change-year.png')}
      />
    ),
    text: <TextNode text="切换学年" />,
  },
];
