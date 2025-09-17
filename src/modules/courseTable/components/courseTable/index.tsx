import { makeImageFromView } from '@shopify/react-native-skia';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import React, {
  memo,
  RefObject,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/button';
import Divider from '@/components/divider';
import Modal from '@/components/modal';
import ScrollableView from '@/components/scrollView';
import ThemeChangeText from '@/components/text';
import Toast from '@/components/toast';

import useCourse from '@/store/course';
import useThemeBasedComponents from '@/store/themeBasedComponents';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import LocationIcon from '@/assets/icons/calendar/location.svg';
import TeacherIcon from '@/assets/icons/calendar/teacher.svg';
import TimeIcon from '@/assets/icons/calendar/time.svg';
import WeekIcon from '@/assets/icons/calendar/week.svg';
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
import { deleteCourse } from '@/request/api/course';
import { commonColors } from '@/styles/common';
import globalEventBus from '@/utils/eventBus';

import { CourseTableProps, CourseTransferType, courseType } from './type';

type CourseContentProps = CourseTransferType & {
  originalData: courseType[];
  currentWeek: number;
};

// 课程内容组件
const CourseContent: React.FC<CourseContentProps> = memo(
  function CourseContent(props) {
    const { class_when, originalData, currentWeek } = props;

    // removed unused semester/year destructure to satisfy linter

    const CourseItem = useThemeBasedComponents(
      state => state.CurrentComponents?.CourseItem
    );

    const slotCourses = React.useMemo(
      () =>
        originalData.filter(
          c => c.day - 1 === props.colIndex && c.class_when === class_when
        ),
      [originalData, props.colIndex, class_when]
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
            left:
              COURSE_HORIZONTAL_PADDING + COURSE_ITEM_WIDTH * props.colIndex,
          }}
          onPress={() => {
            Modal.show({
              isTransparent: true,
              children: (
                <View
                  style={{ minHeight: 220, height: slotCourses.length * 260 }}
                >
                  <ScrollView style={{ width: '100%' }}>
                    {slotCourses.map((c, idx) => (
                      <View
                        key={`${c.id}`}
                        style={{
                          marginBottom: idx === slotCourses.length - 1 ? 0 : 12,
                        }}
                      >
                        <ModalContent
                          id={c.id}
                          class_when={c.class_when}
                          isThisWeek={c.weeks.includes(currentWeek)}
                          courseName={c.classname}
                          teacher={c.teacher}
                          classroom={c.where}
                          week_duration={c.week_duration}
                          credit={c.credit}
                          date={daysOfWeek[props.colIndex]}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ),
              mode: 'middle',
              // confirmText: '退出',
              // cancelText: '删除课程',
              // onConfirm: () => {},
              // onCancel: () => {
              //   deleteCourse(props.id, semester, year).then(res => {
              //     console.log(res);
              //     useCourse.getState().deleteCourse(props.id);
              //   });
              // },
            });
          }}
        >
          {CourseItem && <CourseItem {...props}></CourseItem>}
          {slotCourses.length > 1 && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#FF4D4F',
                zIndex: 100,
              }}
            />
          )}
        </Pressable>
      </>
    );
  }
);

const Timetable: React.FC<CourseTableProps> = ({
  data,
  currentWeek,
  onTimetableRefresh,
}) => {
  // 是否为刷新状态
  const [_, setIsFetching] = useState<boolean>(false);
  const [snapshot, setSnapShot] = useState(false);
  const { currentStyle, themeName } = useVisualScheme(
    ({ currentStyle, themeName }) => ({ currentStyle, themeName })
  );
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef<View>(null);
  // 完整课表内容的引用
  const fullTableRef = useRef<View>(null);

  const onSaveImageAsync = async () => {
    try {
      // 在真正需要使用权限时才请求
      if (status?.status !== 'granted') {
        const permissionResult = await requestPermission();
        if (permissionResult.status !== 'granted') {
          Toast.show({
            text: '需要相册权限才能保存截图',
            icon: 'fail',
          });
          return;
        }
      }
      setSnapShot(true);
      // 确保截图前视图已完全渲染
      setTimeout(async () => {
        try {
          // 将滚动位置重置到顶部
          globalEventBus.emit('ResetScrollPosition');

          // 给予时间让滚动位置重置
          await new Promise(resolve => setTimeout(resolve, 100));
          // 使用完整课表内容的引用而不是滚动视图
          const snapshot = await makeImageFromView(
            fullTableRef as RefObject<View>
          );
          if (!snapshot) {
            Toast.show({
              text: '截图失败',
              icon: 'fail',
            });
            setSnapShot(false);
            return;
          }

          const data = snapshot?.encodeToBase64();
          const uri = `data:image/png;base64,${data}`;

          const manipulateResult = await ImageManipulator.manipulateAsync(
            uri,
            [],
            {
              compress: 1,
              format: ImageManipulator.SaveFormat.PNG,
              base64: false,
            }
          );

          if (manipulateResult && manipulateResult.uri) {
            // 这里创建资源的时候就会保存到相册
            await MediaLibrary.createAssetAsync(manipulateResult.uri);
            Toast.show({
              text: '截图成功',
              icon: 'success',
            });
            setSnapShot(false);
          }
        } catch (error) {
          Toast.show({ text: `截图失败：${error}`, icon: 'fail' });
          setSnapShot(false);
          return;
        }
      }, 500); // 给予足够的时间让视图完全渲染
    } catch (e) {
      Toast.show({ text: `截图失败：${e}`, icon: 'fail' });
      setSnapShot(false);
    }
  };

  useEffect(() => {
    globalEventBus.on('SaveImageShot', onSaveImageAsync);

    return () => {
      // globalEventBus.off('SaveImageShot', onSaveImageAsync);
    };
  }, []);

  // 计算课程表内容的memoized值
  const { timetableMatrix, courses } = React.useMemo(() => {
    // 时刻表
    const timetableMatrix: ({
      classname: string;
      timeSpan: number;
    } | null)[][] = timeSlots.map(() => Array(daysOfWeek.length).fill(null));
    const courses: CourseTransferType[] = [];
    // 先按时间槽和日期分组课程
    const coursesBySlot = new Map();
    data.forEach((course: courseType) => {
      const {
        id,
        day,
        teacher,
        where,
        class_when,
        classname,
        weeks,
        week_duration,
        credit,
      } = course;

      // 计算课程的时间跨度（占几节课）
      const timeSpan = class_when
        .split('-')
        .map(Number)
        .reduce((a: number, b: number) => b - a + 1);

      // 计算课程在课表中的位置
      const rowIndex = Number(class_when.split('-')[0]) - 1; // 第几节课开始
      const colIndex = day - 1; // 周几（0-6，对应周一到周日）
      const key = `${rowIndex}-${colIndex}`; // 生成唯一键，标识时间槽位置

      if (rowIndex !== -1 && colIndex !== -1) {
        // 如果该时间槽还没有课程，创建一个空数组
        if (!coursesBySlot.has(key)) {
          coursesBySlot.set(key, []);
        }

        // 将课程添加到对应的时间槽中
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
          isThisWeek: weeks.includes(currentWeek), // 标记是否为当前周的课程
          week_duration,
          credit,
          class_when,
        });
      }
    });

    // 遍历每个时间槽，选择正确的课程显示
    for (const [key, slotCourses] of coursesBySlot) {
      const [rowIndex, colIndex] = key.split('-').map(Number);

      // 当一个时间槽有多节课时，优先显示当前周的课程
      let courseToShow: CourseTransferType | null = null;

      // 1. 首先尝试找到当前周应该显示的课程
      courseToShow =
        slotCourses.find((course: CourseTransferType) =>
          course.weeks.includes(currentWeek)
        ) || null;

      // 2. 如果当前周没有课程，则选择第一节课作为默认显示
      if (!courseToShow && slotCourses.length > 0) {
        courseToShow = slotCourses[0];
      }

      if (courseToShow) {
        timetableMatrix[rowIndex][colIndex] = {
          classname: courseToShow.courseName,
          timeSpan: courseToShow.timeSpan,
        };
        courses.push(courseToShow);
      }
    }
    return { timetableMatrix, courses };
  }, [data, currentWeek]); // 只在data或currentWeek改变时重新计算，返回memoized结果

  // 内容部分
  const content = useDeferredValue(
    React.useMemo(() => {
      return (
        <View
          style={[
            styles.courseWrapperStyle,
            //不设置截图会截出来透明的
            {
              backgroundColor: currentStyle?.background_style?.backgroundColor,
            },
          ]}
        >
          {timetableMatrix.map((row, rowIndex: number) => (
            <View key={rowIndex} style={styles.row}>
              {row.map(
                (
                  subject: { classname: string; timeSpan: number } | null,
                  colIndex: number
                ) => (
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
                )
              )}
            </View>
          ))}
          {/* 课程内容 */}
          {courses.map(item => (
            <CourseContent
              key={item.id}
              {...item}
              originalData={data}
              currentWeek={currentWeek}
            />
          ))}
        </View>
      );
    }, [timetableMatrix, courses, currentStyle])
  );

  // 创建完整课表内容的视图，用于截图
  const fullTableContent = (
    <View
      ref={fullTableRef}
      collapsable={false}
      style={{
        position: 'absolute',
        // opacity: 0, // 隐藏这个视图，只用于截图
        zIndex: -100,
        backgroundColor: currentStyle?.background_style?.backgroundColor,
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* 左上角空白区域 */}
        <View
          style={{
            width: TIME_WIDTH,
            height: COURSE_HEADER_HEIGHT,
            backgroundColor:
              themeName === 'light' ? commonColors.gray : commonColors.black,
          }}
        />
        {/* 顶部周标题 */}
        <StickyTop />
      </View>
      <View style={{ flexDirection: 'row' }}>
        {/* 左侧时间栏 */}
        <View>
          <StickyLeft />
        </View>
        {/* 课表内容 */}
        {data ? content : <ThemeChangeText>正在获取课表...</ThemeChangeText>}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 用于截图的完整课表内容 */}
        {snapshot && fullTableContent}
        <ScrollableView
          // 上方导航栏
          stickyTop={<StickyTop />}
          ref={imageRef}
          collapsable={false}
          cornerStyle={{
            backgroundColor:
              themeName === 'light'
                ? commonColors.lightGray
                : commonColors.black,
          }}
          onRefresh={async (handleSuccess, handleFail) => {
            try {
              setIsFetching(true);
              // onTimetableRefresh returns a Promise so we need to await it
              await onTimetableRefresh(true);
              handleSuccess();
            } catch {
              //console.error('刷新失败:', error);
              handleFail();
            } finally {
              setIsFetching(false);
            }
          }}
          // 学霸也是要睡觉的 ！！！！！！
          stickyBottom={<StickyBottom />}
          // 左侧时间栏
          stickyLeft={<StickyLeft />}
          style={{ flex: 1 }}
        >
          {/* 内容部分 (课程表) */}
          {data ? content : <ThemeChangeText>正在获取课表...</ThemeChangeText>}
        </ScrollableView>
      </View>
    </View>
  );
};

interface ModalContentProps {
  id: string;
  courseName: string;
  teacher: string;
  classroom: string;
  isThisWeek: boolean;
  week_duration: string;
  credit: number;
  class_when: string;
  date: string;
}

const ModalContent: React.FC<ModalContentProps> = memo(
  function ModalContent(props) {
    const {
      id,
      courseName,
      teacher,
      classroom,
      isThisWeek,
      week_duration,
      credit,
      class_when,
      date,
    } = props;
    const currentStyle = useVisualScheme(state => state.currentStyle);

    return (
      <View
        style={[
          styles.modalContainer,
          { width: 280 },
          { paddingHorizontal: 20 },
          { paddingVertical: 10 },
          currentStyle?.modal_background_style,
        ]}
      >
        <View style={styles.modalHeader}>
          <ThemeChangeText style={styles.modalTitle}>
            {courseName}
          </ThemeChangeText>
        </View>
        <View style={styles.modalSubtitleRow}>
          <Text style={styles.modalSubtitleText}>{credit}学分</Text>
          {!isThisWeek && (
            <View style={styles.notThisWeekTag}>
              <Text style={styles.notThisWeekText}>非本周</Text>
            </View>
          )}
        </View>

        <View style={styles.modalInfoGrid}>
          <View style={styles.modalInfoItem}>
            <View style={styles.modalInfoIcon}>
              <WeekIcon width={20} height={20} />
            </View>
            <Text style={[styles.modalInfoText, currentStyle?.text_style]}>
              {week_duration}
            </Text>
          </View>

          <View style={styles.modalInfoItem}>
            <View style={styles.modalInfoIcon}>
              <TimeIcon width={20} height={20} />
            </View>
            <Text style={[styles.modalInfoText, currentStyle?.text_style]}>
              周{date}
              {class_when}节
            </Text>
          </View>

          <View style={styles.modalInfoItem}>
            <View style={styles.modalInfoIcon}>
              <TeacherIcon width={20} height={20} />
            </View>
            <Text style={[styles.modalInfoText, currentStyle?.text_style]}>
              {teacher}
            </Text>
          </View>

          <View style={styles.modalInfoItem}>
            <View style={styles.modalInfoIcon}>
              <LocationIcon width={20} height={20} />
            </View>
            <Text style={[styles.modalInfoText, currentStyle?.text_style]}>
              {classroom}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            justifyContent: 'space-around',
          }}
        >
          <Button
            style={{ borderRadius: 20, width: 100 }}
            onPress={() => {
              Modal.clear();
              router.push({
                pathname: '/(courseTable)/editCourse',
                params: { id },
              });
            }}
          >
            编辑
          </Button>
          <Button
            style={{ borderRadius: 20, width: 100 }}
            onPress={() => {
              Modal.clear();
              Modal.show({
                title: '删除课程',
                children: '确定要删除该课程吗？',
                mode: 'middle',
                showCancel: true,
                confirmText: '删除',
                cancelText: '取消',
                onConfirm: () => {
                  deleteCourse(
                    id,
                    useTimeStore.getState().semester,
                    useTimeStore.getState().year
                  )
                    .then(res => {
                      if (res.code === 0) {
                        useCourse.getState().deleteCourse(id);
                        Modal.show({
                          title: '删除成功',
                          children: '课程已删除',
                          mode: 'middle',
                          showCancel: false,
                        });
                      }
                    })
                    .catch(err => {
                      if (err.response.data.code === 50001) {
                        Modal.show({
                          title: '删除失败',
                          children: '从教务系统导入的课程不支持删除',
                          mode: 'middle',
                          showCancel: false,
                        });
                      }
                    });
                },
              });
            }}
          >
            删除
          </Button>
        </View>
      </View>
    );
  }
);

export const StickyTop: React.FC = memo(function StickyTop() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const { selectedWeek } = useTimeStore();
  const schoolTime = useCourse(state => state.schoolTime);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const calculateDates = async () => {
      try {
        if (!schoolTime) {
          return;
        }

        // 计算开学日期
        const startTimestamp = schoolTime * 1000;
        const startDate = new Date(startTimestamp);

        // 计算当前周的第一天（周一）
        const daysToAdd = (selectedWeek - 1) * 7;
        const currentWeekStartDate = new Date(startDate);
        currentWeekStartDate.setDate(startDate.getDate() + daysToAdd);

        // 计算当前周的每一天
        const weekDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(currentWeekStartDate);
          date.setDate(currentWeekStartDate.getDate() + i);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          weekDates.push(`${month}/${day}`);
        }
        setDates(weekDates);
      } catch {
        throw new Error('计算日期失败');
      }
    };

    calculateDates();
  }, [selectedWeek, schoolTime]);

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
    flex: 1,
    overflow: 'visible', // 修改为visible以确保内容不被裁剪
    paddingBottom: 20,
  },
  courseWrapperStyle: {
    position: 'relative',
    width: COURSE_ITEM_WIDTH * daysOfWeek.length,
    height: COURSE_ITEM_HEIGHT * timeSlots.length,
    overflow: 'visible', // 修改为visible以确保内容不被裁剪
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
    overflow: 'hidden',
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
    height: 20,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  notThisWeekText: {
    fontSize: 12,
    color: '#666',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalSubtitleRow: {
    height: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modalSubtitleText: {
    height: 20,
    lineHeight: 20,
    fontSize: 14,
    color: '#666',
    marginRight: 6,
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
  modalInfoText: {
    fontSize: 14,
    color: '#333',
    maxWidth: '80%',
  },
});

export default memo(Timetable);
