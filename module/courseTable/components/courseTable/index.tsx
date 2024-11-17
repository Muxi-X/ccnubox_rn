import React, {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue, withSpring } from 'react-native-reanimated';

import Divider from '@/components/divider';
import ScrollableView from '@/components/scrollView';
import ThemeChangeText from '@/components/text';
import ThemeChangeView from '@/components/view';

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

import { CourseTableProps, courseType } from './type';

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
              <Text style={styles.headerText}>{index + 1}</Text>
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
            <Text style={styles.timeText}>{index + 1}</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        ))}
      </>
    );
  }, [timeSlots]);
  // 内容部分
  // const content = useDeferredValue(
  //   (() => {
  //     // 时刻表
  //     const timetableMatrix = timeSlots.map(() =>
  //       Array(daysOfWeek.length).fill(null)
  //     );
  //     // 遍历传入的数据，根据时间和日期填充表格
  //     data.forEach(({ courseName, time, date, timeSpan }) => {
  //       const rowIndex = timeSlots.indexOf(time);
  //       const colIndex = daysOfWeek.indexOf(date);
  //       if (rowIndex !== -1 && colIndex !== -1) {
  //         timetableMatrix[rowIndex][colIndex] = { courseName, timeSpan };
  //       }
  //     });
  //     return (
  //       <View style={styles.courseWrapperStyle}>
  //         {timetableMatrix.map((row, rowIndex) => (
  //           <View key={rowIndex} style={styles.row}>
  //             {row.map((subject, colIndex) => (
  //               <View
  //                 key={colIndex}
  //                 style={[
  //                   styles.cell,
  //                   {
  //                     // 左侧固定栏和右侧内容下划线根据 collapse 确定比例关系
  //                     // 例如：默认 collapse 为2，则代表默认 timeslot 隔2个单元出现下划线
  //                     borderBottomColor:
  //                       (rowIndex + 1) % courseCollapse
  //                         ? 'transparent'
  //                         : commonColors.gray,
  //                   },
  //                 ]}
  //               >
  //                 {subject && <Content subject={subject}></Content>}
  //               </View>
  //             ))}
  //           </View>
  //         ))}
  //       </View>
  //     );
  //   })()
  // );
  const content = useMemo(() => {
    const colorOptions = [
      'rgba(155, 134, 253, 1)',
      'rgba(184, 203, 255, 1)',
      'rgba(184, 166, 245, 1)',
      'rgba(255, 203, 184, 1)',
      'rgba(243, 159, 167, 1)',
    ];

    // 时刻表
    const timetableMatrix = timeSlots.map(() =>
      Array(daysOfWeek.length)
        .fill(null)
        .map(() => ({
          courseName: null as string | null,
          teacher: null as string | null,
          classroom: null as string | null,
        }))
    );
    // 遍历传入的数据，根据时间和日期填充表格
    data.forEach(({ courseName, time, date, teacher, classroom }) => {
      const rowIndex = timeSlots.indexOf(time);
      const colIndex = daysOfWeek.indexOf(date);
      if (rowIndex !== -1 && colIndex !== -1) {
        timetableMatrix[rowIndex][colIndex] = {
          courseName,
          teacher: null,
          classroom: null,
        };
        if (rowIndex + 1 < timetableMatrix.length) {
          timetableMatrix[rowIndex + 1][colIndex] = {
            courseName: null,
            teacher,
            classroom,
          };
        }
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
                <View
                  style={[
                    subject.courseName || subject.teacher || subject.classroom
                      ? {
                          height: COURSE_ITEM_HEIGHT,
                          width: COURSE_ITEM_WIDTH - 6,
                          backgroundColor: colorOptions[colIndex],
                          marginTop: (rowIndex + 1) % courseCollapse ? 5 : 0,
                          marginBottom: (rowIndex + 1) % courseCollapse ? 0 : 5,
                          borderTopLeftRadius:
                            (rowIndex + 1) % courseCollapse ? 5 : 0,
                          borderTopRightRadius:
                            (rowIndex + 1) % courseCollapse ? 5 : 0,
                          borderBottomLeftRadius:
                            (rowIndex + 1) % courseCollapse ? 0 : 5,
                          borderBottomRightRadius:
                            (rowIndex + 1) % courseCollapse ? 0 : 5,
                        }
                      : {},
                  ]}
                >
                  {subject.courseName && (
                    <View style={[styles.cellText, styles.cellTextCourseName]}>
                      <Text>{subject.courseName}</Text>
                    </View>
                  )}
                  {subject.teacher && (
                    <View style={styles.cellText}>
                      <Text>
                        {subject.classroom && `@${subject.classroom}`}
                      </Text>
                      <Text>{subject.teacher}</Text>
                    </View>
                  )}
                </View>
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
          stickyTop={<StickyTop />}
          onRefresh={(handleSuccess, handleFail) => {
            setTimeout(() => {
              alert(666);
              handleSuccess();
            }, 7000);
          }}
          // 学霸也是要睡觉的 ！！！！！！
          stickyBottom={<StickyBottom />}
          // 左侧时间栏
          stickyLeft={<StickyLeft />}
        >
          {/* 内容部分 (课程表) */}
          {content ?? <ThemeChangeText>正在获取课表...</ThemeChangeText>}
        </ScrollableView>
      </View>
    </View>
  );
};

export const Content: React.FC<{ subject: courseType }> = ({ subject }) => {
  return (
    <View
      style={{
        position: 'absolute',
        width: styles.cell.width - COURSE_HORIZONTAL_PADDING * 2,
        height: styles.cell.height - COURSE_HORIZONTAL_PADDING * 2,
        borderRadius: 5,
        backgroundColor: 'red',
        top: COURSE_VERTICAL_PADDING,
        left: COURSE_HORIZONTAL_PADDING,
      }}
    >
      <ThemeChangeText style={styles.cellText}>
        {subject?.courseName || ''}
      </ThemeChangeText>
    </View>
  );
};

export const StickyTop: React.FC = memo(function StickyTop() {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {daysOfWeek.map((day, index) => (
          <ThemeChangeView key={index} style={[styles.headerCell]}>
            <ThemeChangeText style={styles.headerText}>{day}</ThemeChangeText>
          </ThemeChangeView>
        ))}
      </View>
    </View>
  );
});

export const StickyLeft: React.FC = memo(function StickyLeft() {
  return (
    <>
      {timeSlots.map((time, index) => (
        <ThemeChangeView key={index} style={styles.timeSlot}>
          <ThemeChangeText style={styles.timeText}>{time}</ThemeChangeText>
        </ThemeChangeView>
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
    height: COURSE_HEADER_HEIGHT * 2,
  },
  headerRow: {
    flexDirection: 'row',
  },
  headerCell: {
    width: COURSE_ITEM_WIDTH,
    height: COURSE_HEADER_HEIGHT * 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#eee',
    borderColor: commonColors.gray,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
  },
  headerText: {
    justifyContent: 'center',
    alignItems: 'center',
    height: COURSE_HEADER_HEIGHT,
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
    height: COURSE_ITEM_HEIGHT, // 必须与 timeSlot 的高度保持一致
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderRightColor: commonColors.gray,
  },
  cellText: {
    padding: 10,
    height: COURSE_ITEM_HEIGHT - 10,
    width: COURSE_ITEM_WIDTH - 10,
    textAlign: 'left',
  },
  cellTextCourseName: {
    marginTop: 20,
  },
});

export default memo(Timetable);
