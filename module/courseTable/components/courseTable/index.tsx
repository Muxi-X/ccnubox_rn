import React, { memo, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';

import Divider from '@/components/divider';
import ScrollableView from '@/components/scrollView';
import {
  COURSE_HEADER_HEIGHT,
  COURSE_ITEM_HEIGHT,
  COURSE_ITEM_WIDTH,
  courseCollapse,
  daysOfWeek,
  TIME_WIDTH,
  timeSlots,
} from '@/constants/courseTable';
import { commonColors } from '@/styles/common';

import { CourseTableProps } from './type';

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
  // 上方导航栏
  const stickyTop = useMemo(() => {
    return (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {daysOfWeek.map((day, index) => (
            <View key={index} style={[styles.headerCell]}>
              <Text style={styles.headerText}>{day}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }, [daysOfWeek]);
  // 学霸也是要睡觉的 ！！！！！！
  const stickyBottom = useMemo(() => {
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
  }, []);
  // 左侧时间栏
  const stickyLeft = useMemo(() => {
    return (
      <>
        {timeSlots.map((time, index) => (
          <View key={index} style={styles.timeSlot}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        ))}
      </>
    );
  }, [timeSlots]);
  // 内容部分
  const content = useMemo(() => {
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
      <View style={styles.courseWrapperStyle}>
        {timetableMatrix.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((subject, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.cell,
                  {
                    // 左侧固定栏和右侧内容下划线根据 collapse 确定比例关系
                    // 例如：默认 collapse 为2，则代表默认 timeslot 隔2个单元出现下划线
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
    );
  }, [timeSlots, data, daysOfWeek]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollableView
          // 上方导航栏
          stickyTop={stickyTop}
          onRefresh={(handleSuccess, handleFail) => {
            setTimeout(() => {
              alert(666);
              handleSuccess();
            }, 7000);
          }}
          // 学霸也是要睡觉的 ！！！！！！
          stickyBottom={stickyBottom}
          // 左侧时间栏
          stickyLeft={stickyLeft}
        >
          {/* 内容部分 (课程表) */}
          {content}
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

export default memo(Timetable);
