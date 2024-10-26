import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';

import { CourseTableProps } from '@/components/courseTable/type';
import ScrollableView from '@/components/scrollView';
import { commonColors } from '@/styles/common';

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
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 内容部分包括天数以及课表内容 */}
        <ScrollableView
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
