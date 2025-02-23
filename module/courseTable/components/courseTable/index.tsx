import { useRouter } from 'expo-router';
import React, { memo, useDeferredValue, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';

import Divider from '@/components/divider';
import ScrollableView from '@/components/scrollView';
import ThemeChangeText from '@/components/text';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import {
  COURSE_HEADER_HEIGHT,
  COURSE_HORIZONTAL_PADDING,
  COURSE_ITEM_HEIGHT,
  COURSE_ITEM_WIDTH,
  COURSE_VERTICAL_PADDING,
  courseCollapse,
  daysOfWeek,
  TIME_WIDTH,
  timeSlots,
} from '@/constants/courseTable';
import { commonColors } from '@/styles/common';

import { CourseTableProps, CourseTransferType } from './type';

const Timetable: React.FC<CourseTableProps> = ({
  data,
  currentWeek,
  onTimetableRefresh,
}) => {
  // 是否为刷新状态
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const translateY = useSharedValue(0);
  useEffect(() => {
    if (isFetching) {
      setTimeout(() => {
        setIsFetching(false);
        // 搞完就弹回
        translateY.value = withSpring(0);
      }, 2000);
    }
  }, [isFetching]);
  // 内容部分
  const content = useDeferredValue(
    (() => {
      // 时刻表
      const timetableMatrix = timeSlots.map(() =>
        Array(daysOfWeek.length).fill(null)
      );
      const courses: CourseTransferType[] = [];
      // 遍历传入的数据，根据时间和日期填充表格
      data.forEach(
        ({ id, day, teacher, where, class_when, classname, weeks }) => {
          const timeSpan = class_when
            .split('-')
            .map(Number)
            .reduce((a: number, b: number) => b - a + 1);
          const rowIndex = Number(class_when.split('-')[0]) - 1;
          const colIndex = day - 1;
          const isThisWeek = weeks.includes(Number(currentWeek));
          if (rowIndex !== -1 && colIndex !== -1) {
            timetableMatrix[rowIndex][colIndex] = { classname, timeSpan };
            courses.push({
              id,
              courseName: classname,
              timeSpan,
              teacher,
              date: daysOfWeek[colIndex],
              classroom: where,
              rowIndex,
              colIndex,
              isThisWeek,
            });
          }
        }
      );
      return (
        <View style={styles.courseWrapperStyle}>
          {timetableMatrix.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((subject, colIndex) => (
                <View
                  key={colIndex}
                  style={[
                    styles.cell,
                    currentStyle?.schedule_border_style,
                    {
                      // 左侧固定栏和右侧内容下划线根据 collapse 确定比例关系
                      // 例如：默认 collapse 为2，则代表默认 timeslot 隔2个单元出现下划线
                      borderBottomWidth:
                        (rowIndex + 1) % courseCollapse ? 0 : 1,
                    },
                  ]}
                ></View>
              ))}
            </View>
          ))}
          {/* 课程内容 */}
          {courses.map(item => (
            <Content key={item.id} {...item}></Content>
          ))}
        </View>
      );
    })()
  );
  console.log('course_data', data);
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollableView
          // 上方导航栏
          stickyTop={<StickyTop />}
          onRefresh={async (handleSuccess, handleFail) => {
            try {
              await onTimetableRefresh();
              handleSuccess();
            } catch (error) {
              console.error('刷新失败:', error);
              handleFail();
            }
          }}
          // 学霸也是要睡觉的 ！！！！！！
          stickyBottom={<StickyBottom />}
          // 左侧时间栏
          stickyLeft={<StickyLeft />}
        >
          {/* 内容部分 (课程表) */}
          {data ? content : <ThemeChangeText>正在获取课表...</ThemeChangeText>}
        </ScrollableView>
      </View>
    </View>
  );
};

export const Content: React.FC<CourseTransferType> = props => {
  const navigation = useRouter();
  const CourseItem = useThemeBasedComponents(
    state => state.currentComponents?.course_item
  );
  console.log('Content_props', props);
  return (
    <>
      <Pressable
        style={{
          position: 'absolute',
          width: styles.cell.width - COURSE_HORIZONTAL_PADDING * 2,
          zIndex: 99,
          height: 'auto',
          top: COURSE_VERTICAL_PADDING + COURSE_ITEM_HEIGHT * props.rowIndex,
          left: COURSE_HORIZONTAL_PADDING + COURSE_ITEM_WIDTH * props.colIndex,
        }}
        onPress={() => {
          navigation.navigate('/(courseTable)/editCourse');
        }}
      >
        {CourseItem && <CourseItem {...props}></CourseItem>}
      </Pressable>
    </>
  );
};

export const StickyTop: React.FC = memo(function StickyTop() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {daysOfWeek.map((day, index) => (
          <View
            key={index}
            style={[
              styles.headerCell,
              currentStyle?.schedule_item_background_style,
              currentStyle?.schedule_border_style,
            ]}
          >
            <ThemeChangeText style={styles.headerText}>{day}</ThemeChangeText>
            <Text style={styles.dayText}>09/0{index + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

export const StickyLeft: React.FC = memo(function StickyLeft() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  return (
    <>
      {timeSlots.map((time, index) => (
        <View
          key={index}
          style={[
            styles.timeSlot,
            currentStyle?.schedule_item_background_style,
            currentStyle?.schedule_border_style,
          ]}
        >
          <ThemeChangeText style={styles.countText}>
            {index + 1}
          </ThemeChangeText>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      ))}
    </>
  );
});
export const StickyBottom = memo(function StickyBottom() {
  return (
    <Divider
      style={{
        flexShrink: 0,
        width: '100%',
      }}
      color={commonColors.gray}
    >
      别闹，学霸也是要睡觉的
    </Divider>
  );
});
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    flex: 1,
    overflow: 'scroll',
  },
  courseWrapperStyle: {
    position: 'relative',
    width: COURSE_ITEM_WIDTH * daysOfWeek.length,
    height: COURSE_ITEM_HEIGHT * timeSlots.length + COURSE_HEADER_HEIGHT,
    overflow: 'scroll',
    zIndex: -1,
  },
  timeSideBar: {
    width: TIME_WIDTH,
    flexGrow: 0,
    flexShrink: 0,
  },
  weekBlock: {
    width: TIME_WIDTH,
    height: COURSE_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: '#E1E2F1',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    zIndex: 1,
    marginLeft: -1,
  },
  headerRow: {
    flexDirection: 'row',
  },
  headerCell: {
    width: COURSE_ITEM_WIDTH,
    height: COURSE_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
  },
  headerText: {
    fontWeight: 'bold',
  },
  dayText: {
    fontWeight: 'light',
    fontSize: 10,
    color: '#75757B',
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
  },
  timeSlot: {
    height: COURSE_ITEM_HEIGHT, // 每个时间槽的高度
    width: TIME_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  countText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
  },
  timeText: {
    fontWeight: 'light',
    fontSize: 10,
    paddingTop: 2,
    color: '#75757B',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    zIndex: -1,
  },
  cell: {
    position: 'relative',
    width: COURSE_ITEM_WIDTH, // 必须与 headerCell 的宽度保持一致
    height: COURSE_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRightWidth: 1,
    zIndex: 0,
  },
});

export default memo(Timetable);
