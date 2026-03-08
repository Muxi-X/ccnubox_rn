import { ExtensionStorage } from '@bacons/apple-targets';
import { type FC, memo, useCallback, useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useCourseLiveActivity } from '@/hooks/useCourseLiveActivity';

import View from '@/components/view';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import { queryCourseTable, queryCurrentWeek } from '@/request/api/course';
import {
  courseLiveActivity,
  LIVE_ACTIVITY_ENABLED,
} from '@/utils/courseLiveActivity';
import { log } from '@/utils/logger';

import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';
import WeekSelector from './components/WeekSelector';

// 根据开学时间计算学期和年份
const computeSemesterAndYear = (startTimestamp: number) => {
  const startDate = new Date(startTimestamp * 1000);
  const month = startDate.getMonth() + 1; // 获取开学时间的月份
  let semester = '1'; // 默认学期为 '1'
  let year = startDate.getFullYear().toString(); // 默认年份为当前年

  // 根据开学时间计算学期和年份
  if (month >= 1 && month <= 5) {
    // 1月到5月 => 第二学期
    semester = '2';
    year = (new Date().getFullYear() - 1).toString(); // 前一年
  } else if (month >= 6 && month <= 7) {
    // 6月到7月 => 第三学期
    semester = '3';
    year = (new Date().getFullYear() - 1).toString(); // 前一年
  } else if (month >= 8 && month <= 12) {
    // 8月到12月 => 第一学期
    semester = '1';
    year = new Date().getFullYear().toString(); // 当前年
  }
  return { semester, year };
};

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const extensionStorage = useMemo(() => {
    return new ExtensionStorage('group.release-20240916');
  }, []);

  const {
    courses,
    updateCourses,
    setLastUpdate,
    setHolidayTime,
    schoolTime,
    setSchoolTime,
  } = useCourse();
  const {
    semester,
    setSemester,
    year,
    setYear,
    selectedWeek,
    setSelectedWeek,
    showWeekPicker,
    setShowWeekPicker,
  } = useTimeStore();
  // setSchoolTime, setHolidayTime, setSelectedWeek
  const fetchCurrentWeek = useCallback(async () => {
    try {
      const res = await queryCurrentWeek();
      if (res?.code === 0 && res.data?.school_time && res.data?.holiday_time) {
        setSchoolTime(res.data.school_time);
        setHolidayTime(res.data.holiday_time);
        const { semester, year } = computeSemesterAndYear(res.data.school_time);
        setSemester(semester);
        setYear(year);

        // 保存当前周数据到 UserDefaults 供 widget 使用
        extensionStorage.set('schoolTime', res.data.school_time);
        extensionStorage.set('holidayTime', res.data.holiday_time);
        ExtensionStorage.reloadWidget();

        setTimeout(
          () => setSelectedWeek(useTimeStore.getState().getCurrentWeek()),
          0
        );
      }
    } catch (err) {
      log.error('Failed to fetch current week:', err);
    }
  }, [
    setSchoolTime,
    setHolidayTime,
    setSelectedWeek,
    setSemester,
    setYear,
    extensionStorage,
  ]);

  // 刷新课程表数据，先从缓存中获取开学时间，若无则重新请求
  const onTimetableRefresh = useCallback(
    async (forceRefresh: boolean = false) => {
      fetchCurrentWeek();
      try {
        // 使用计算得到的学期和年份
        const res = await queryCourseTable({
          semester,
          year,
          refresh: forceRefresh,
        });

        if (
          res?.code === 0 &&
          res.data?.classes &&
          res.data.last_refresh_time
        ) {
          const courses = res.data.classes as courseType[];
          // 缓存课表
          updateCourses(courses);
          extensionStorage.set(
            'courseTable',
            courses.map(course => ({
              ...course,
              is_official: course.is_official ? 1 : 0,
              weeks: JSON.stringify(course.weeks),
            }))
          );
          ExtensionStorage.reloadWidget();
          setLastUpdate(res.data.last_refresh_time);
        }
      } catch (error) {
        log.error('Failed to refresh timetable:', error);
      }
    },
    [
      semester,
      year,
      updateCourses,
      setLastUpdate,
      extensionStorage.set,
      fetchCurrentWeek,
    ]
  );

  // 获取当前周数
  useEffect(() => {
    fetchCurrentWeek();
  }, [fetchCurrentWeek]);

  // 刷新课表数据
  useEffect(() => {
    if (schoolTime) {
      onTimetableRefresh();
    }
  }, [schoolTime, onTimetableRefresh]);

  // 启用 Live Activity 自动提醒
  useCourseLiveActivity(courses);

  // 测试 Live Activity
  const handleTestLiveActivity = useCallback(async () => {
    if (!LIVE_ACTIVITY_ENABLED) {
      alert('Live Activity 已在当前版本关闭');
      return;
    }

    if (Platform.OS !== 'ios') {
      alert('Live Activity 仅支持 iOS');
      return;
    }

    // 启动 Live Activity，模拟 10 分钟倒计时
    const classStartTime = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后
    // 仅在这次倒计时窗口内忽略自动课表检查，模拟“10分钟后有课”
    courseLiveActivity.enableManualMode(10 * 60 * 1000 + 30 * 1000);
    const activityId = await courseLiveActivity.startCourseReminder(
      {
        courseName: 'test',
        location: 'a108',
        startTime: '08:00',
        endTime: '09:40',
      },
      classStartTime
    );

    if (activityId) {
      alert(
        `Live Activity 已启动（测试模式）\n10分钟后自动结束\nID: ${activityId}`
      );
      return;
    }

    courseLiveActivity.disableManualMode();
    alert('Live Activity 启动失败，请查看控制台日志');
  }, []);

  return (
    <View
      style={[{ height: '95%', width: '100%' }, currentStyle?.background_style]}
    >
      <CourseTable
        data={courses}
        onTimetableRefresh={onTimetableRefresh}
        currentWeek={selectedWeek}
      />
      {showWeekPicker && (
        <WeekSelector
          currentWeek={selectedWeek}
          showWeekPicker={showWeekPicker}
          onWeekSelect={week => {
            setSelectedWeek(week);
            setShowWeekPicker(false);
          }}
        />
      )}

      {/* 测试 Live Activity 按钮 */}
      {Platform.OS === 'ios' && LIVE_ACTIVITY_ENABLED && (
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestLiveActivity}
        >
          <Text style={styles.testButtonText}>🧪 测试动态岛</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  testButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default memo(CourseTablePage);
