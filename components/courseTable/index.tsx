import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CourseTableProps } from '@/components/courseTable/type';
import Divider from '@/components/divider';
import { commonColors } from '@/styles/common';
import ScrollableView from '@/components/scrollView';

const COURSE_ITEM_WIDTH = 100;
const COURSE_ITEM_HEIGHT = 80;
const COURSE_HEADER_HEIGHT = 40;
const TIME_WIDTH = 60;
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sta', 'Sun'];
const courseCollapse = 2;
const timeSlots = [
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
  '14:00',
  '16:00',
  '18:00',
];
const Timetable: React.FC<CourseTableProps> = ({ data }) => {
  // 是否为刷新状态
  const [isFetching, setIsFetching] = useState<boolean>(false);
  // 组件是否位于顶部，由于原生组件没有检测 overscroll 的能力，因此用 state 代替
  const [isAtTop, setIsAtTop] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  // 记录拖动中 x,y 偏移
  const movedPos = useRef<Record<'x' | 'y', number>>({ x: 0, y: 0 });
  const timeSideBarRef = useRef<ScrollView>(null);
  // 下拉刷新动画
  const backHeight = useSharedValue(0);
  const scale = useSharedValue(0);
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
  // 时刻表
  const timetableMatrix = timeSlots.map(() =>
    Array(daysOfWeek.length).fill(null)
  );
  // 遍历传入的数据，根据时间和日期填充表格
  data.forEach(({ courseName, time, date }) => {
    const rowIndex = timeSlots.indexOf(time);
    const colIndex = daysOfWeek.indexOf(date);
    if (rowIndex !== -1 && colIndex !== -1) {
      timetableMatrix[rowIndex][colIndex] = courseName;
    }
  });
  // 滚动到头后松手，进入到下拉刷新
  const handleScrollTop = () => {
    setIsAtTop(true);
  };
  const handleScrollBottom = () => {
    setIsAtBottom(true);
  };
  // 同步时间轴和内容
  const innerScrollHandler = (
    event: GestureUpdateEvent<PanGestureHandlerEventPayload>
  ) => {
    timeSideBarRef.current!.scrollTo({
      x: 0,
      y: event.translationY,
      animated: false,
    });
  };
  // 外部滚动检测蒙层
  const pan = Gesture.Pan()
    .onEnd(evt => {
      runOnJS(setIsFetching)(true);
      runOnJS(setIsAtBottom)(false);
      runOnJS(setIsAtTop)(false);
      if (evt.translationY < 0) translateY.value = withSpring(0);
    })
    .onUpdate(evt => {
      scale.value = withTiming(evt.translationY);
      translateY.value = backHeight.value = withSpring(evt.translationY);
    });
  const outerScrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[
          {
            width: '100%',
            height: backHeight,
            backgroundColor: '#000',
            zIndex: -1,
            position: 'absolute',
            top: 0,
          },
        ]}
      ></Animated.View>
      <Animated.View
        style={[{ backgroundColor: '#fff', flex: 1 }, outerScrollStyle]}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
            {/* 内容部分包括天数以及课表内容 */}
            <ScrollableView
              // onScroll={innerScrollHandler}
              onScrollToTop={handleScrollTop}
              // 上方导航栏
              stickyTop={
                <>
                  <View style={styles.header}>
                    <View style={styles.headerRow}>
                      {daysOfWeek.map((day, index) => (
                        <View key={index} style={[styles.headerCell]}>
                          <Text style={styles.headerText}>{day}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              }
              // 左侧时间栏
              stickyLeft={
                <>
                  {timeSlots.map((time, index) => (
                    <View key={index} style={styles.timeSlot}>
                      <Text style={styles.timeText}>{time}</Text>
                    </View>
                  ))}
                </>
              }
              onScrollToBottom={handleScrollBottom}
            >
              {/* 内容部分 (课程表) */}
              <View style={styles.courseWrapperStyle}>
                {timetableMatrix.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((subject, colIndex) => (
                      <View
                        key={colIndex}
                        style={[
                          styles.cell,
                          {
                            borderBottomColor:
                              (rowIndex + 1) % courseCollapse
                                ? 'transparent'
                                : commonColors.gray,
                          },
                        ]}
                      >
                        <Text style={styles.cellText}>{subject || ''}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollableView>
          </View>
          <Divider color={commonColors.gray}>别闹，学霸也是要睡觉的</Divider>
        </View>
        {/* 避免滚动冲突，当内部内容滚到边界时，启动蒙层，滚动外部 */}
        {(isAtTop || isAtBottom) && (
          <GestureDetector gesture={pan}>
            <View
              style={{
                flex: 1,
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
              }}
            ></View>
          </GestureDetector>
        )}
      </Animated.View>
    </View>
  );
};

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
    // flexGrow: 1,
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
    backgroundColor: '#eee',
    borderColor: commonColors.gray,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    zIndex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#eee',
    borderColor: commonColors.gray,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
  },
  headerText: {
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
  },
  timeSlot: {
    height: COURSE_ITEM_HEIGHT, // 每个时间槽的高度
    width: TIME_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: commonColors.gray,
  },
  timeText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: COURSE_ITEM_WIDTH, // 必须与 headerCell 的宽度保持一致
    height: COURSE_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderRightColor: commonColors.gray,
  },
  cellText: {
    textAlign: 'center',
  },
});

export default Timetable;
