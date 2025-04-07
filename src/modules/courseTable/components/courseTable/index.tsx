import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeImageFromView } from '@shopify/react-native-skia';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import React, {
  memo,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Divider from '@/components/divider';
import Modal from '@/components/modal';
import ScrollableView from '@/components/scrollView';
import ThemeChangeText from '@/components/text';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';
import useWeekStore from '@/store/weekStore';

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
import globalEventBus from '@/utils/eventBus';

import { CourseTableProps, CourseTransferType, courseType } from './type';

const Timetable: React.FC<CourseTableProps> = ({
  data,
  currentWeek,
  onTimetableRefresh,
}) => {
  // 是否为刷新状态
  const [_, setIsFetching] = useState<boolean>(false);
  const { currentStyle, themeName } = useVisualScheme(
    ({ currentStyle, themeName }) => ({ currentStyle, themeName })
  );
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef<View>(null);
  if (status === null) {
    requestPermission();
  }
  const onSaveImageAsync = async () => {
    try {
      // const localUri = await captureRef(imageRef, {
      //   height: 1200,
      //   quality: 1,
      // });

      // await MediaLibrary.saveToLibraryAsync(localUri);
      // if (localUri) {
      //   Modal.show({
      //     title: '截图成功',
      //     mode: 'middle',
      //   });
      // }

      const snapshot = await makeImageFromView(imageRef);
      if (!snapshot) {
        Modal.show({
          title: '截图失败',
          mode: 'middle',
        });
      }
      const data = await snapshot?.encodeToBase64();
      const uri = `data:image/png;base64,${data}`;

      const result = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG,
        base64: false,
      });

      if (result && result.uri) {
        const assets = await MediaLibrary.createAssetAsync(result.uri);
        await MediaLibrary.saveToLibraryAsync(assets.uri);
        Modal.show({
          title: '截图成功',
          mode: 'middle',
        });
      }
    } catch (e) {
      Modal.show({ title: `截图失败：${e}` });
      console.log(e);
    }
  };

  useEffect(() => {
    globalEventBus.on('SaveImageShot', onSaveImageAsync);

    return () => {
      globalEventBus.off('SaveImageShot', onSaveImageAsync);
    };
  }, []);
  // 内容部分
  const content = useDeferredValue(
    (() => {
      // 时刻表
      const timetableMatrix = timeSlots.map(() =>
        Array(daysOfWeek.length).fill(null)
      );
      const courses: CourseTransferType[] = [];
      // 先按时间槽和日期分组课程
      const coursesBySlot = new Map();
      data.forEach((course: courseType) => {
        const { id, day, teacher, where, class_when, classname, weeks } =
          course;
        const timeSpan = class_when
          .split('-')
          .map(Number)
          .reduce((a: number, b: number) => b - a + 1);
        const rowIndex = Number(class_when.split('-')[0]) - 1;
        const colIndex = day - 1;
        const key = `${rowIndex}-${colIndex}`;

        if (rowIndex !== -1 && colIndex !== -1) {
          if (!coursesBySlot.has(key)) {
            coursesBySlot.set(key, []);
          }
          coursesBySlot.get(key).push({
            id,
            courseName: classname,
            timeSpan,
            teacher,
            date: daysOfWeek[colIndex],
            classroom: where,
            rowIndex,
            colIndex,
            weeks,
            isThisWeek: weeks.includes(currentWeek),
          });
        }
      });

      // 遍历每个时间槽，选择正确的课程显示
      for (const [key, slotCourses] of coursesBySlot) {
        const [rowIndex, colIndex] = key.split('-').map(Number);

        // 找到当前周应该显示的课程
        const courseToShow =
          slotCourses.find((course: CourseTransferType & { weeks: number[] }) =>
            course.weeks.includes(currentWeek)
          ) || slotCourses[0];

        if (courseToShow) {
          timetableMatrix[rowIndex][colIndex] = {
            classname: courseToShow.courseName,
            timeSpan: courseToShow.timeSpan,
          };
          courses.push(courseToShow);
        }
      }
      return (
        <View
          style={[
            styles.courseWrapperStyle,
            //不设置截图会截出来透明的
            {
              backgroundColor: currentStyle?.background_style?.backgroundColor,
            },
          ]}
          ref={imageRef}
          collapsable={false}
        >
          {timetableMatrix?.map((row, rowIndex) => (
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
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollableView
          // 上方导航栏
          stickyTop={<StickyTop />}
          conrerStyle={{
            backgroundColor:
              themeName === 'light' ? commonColors.gray : commonColors.black,
          }}
          onRefresh={async (handleSuccess, handleFail) => {
            try {
              setIsFetching(true);
              await onTimetableRefresh(true);
              handleSuccess();
            } catch (error) {
              console.error('刷新失败:', error);
              handleFail();
            } finally {
              setIsFetching(false);
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
interface ModalContentProps {
  courseName: string;
  teacher: string;
  classroom: string;
  isThisWeek: boolean;
}

export const ModalContent: React.FC<ModalContentProps> = props => {
  const { courseName, teacher, classroom, isThisWeek } = props;
  // const currentStyle = useVisualScheme(state => state.currentStyle);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <ThemeChangeText style={styles.modalTitle}>
          {courseName}
        </ThemeChangeText>
        {!isThisWeek && (
          <View style={styles.notThisWeekTag}>
            <Text style={styles.notThisWeekText}>非本周</Text>
          </View>
        )}
      </View>
      <Text style={styles.modalSubtitle}>专业主干课 3.0学分</Text>

      <View style={styles.modalInfoGrid}>
        <View style={styles.modalInfoItem}>
          <View style={styles.modalInfoIcon}>
            <Text style={styles.iconText}>📅</Text>
          </View>
          <Text style={styles.modalInfoText}>1-17周</Text>
        </View>

        <View style={styles.modalInfoItem}>
          <View style={styles.modalInfoIcon}>
            <Text style={styles.iconText}>🕒</Text>
          </View>
          <Text style={styles.modalInfoText}>周一3-4节</Text>
        </View>

        <View style={styles.modalInfoItem}>
          <View style={styles.modalInfoIcon}>
            <Text style={styles.iconText}>👨‍🏫</Text>
          </View>
          <Text style={styles.modalInfoText}>{teacher}</Text>
        </View>

        <View style={styles.modalInfoItem}>
          <View style={styles.modalInfoIcon}>
            <Text style={styles.iconText}>🏢</Text>
          </View>
          <Text style={styles.modalInfoText}>{classroom}</Text>
        </View>
      </View>
    </View>
  );
};
export const Content: React.FC<CourseTransferType> = props => {
  const { classroom, courseName, teacher, isThisWeek } = props;
  const CourseItem = useThemeBasedComponents(
    state => state.currentComponents?.course_item
  );
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
          Modal.show({
            children: (
              <ModalContent
                isThisWeek={isThisWeek}
                courseName={courseName}
                teacher={teacher}
                classroom={classroom}
              ></ModalContent>
            ),
            mode: 'middle',
            confirmText: '删除',
            cancelText: '编辑',

            onConfirm: () => {},
            onCancel: () => {},
          });
        }}
      >
        {CourseItem && <CourseItem {...props}></CourseItem>}
      </Pressable>
    </>
  );
};

export const StickyTop: React.FC = memo(function StickyTop() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const { currentWeek } = useWeekStore();
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const calculateDates = async () => {
      try {
        // 从缓存中获取开学时间
        const schoolTime = await AsyncStorage.getItem('school_time');
        if (!schoolTime) return;

        // 计算开学日期
        const startTimestamp = Number(schoolTime) * 1000;
        const startDate = new Date(startTimestamp);

        // 计算当前周的第一天（周一）
        // 开学日期是第1周的第1天，所以需要计算当前周的第1天
        const daysToAdd = (currentWeek - 1) * 7;
        const currentWeekStartDate = new Date(startDate);
        currentWeekStartDate.setDate(startDate.getDate() + daysToAdd);

        // 计算当前周的每一天
        const weekDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(currentWeekStartDate);
          date.setDate(currentWeekStartDate.getDate() + i);
          const month = date.getMonth() + 1; // 月份从0开始
          const day = date.getDate();
          weekDates.push(`${month}/${day}`);
        }

        setDates(weekDates);
      } catch (error) {
        console.error('计算日期失败:', error);
      }
    };

    calculateDates();
  }, [currentWeek]);

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
            <Text style={styles.dayText}>{dates[index] || ''}</Text>
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
  modalContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notThisWeekTag: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  notThisWeekText: {
    fontSize: 12,
    color: '#666',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  modalInfoItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalInfoIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconText: {
    fontSize: 18,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#333',
  },
});

export default memo(Timetable);
