import { ExtensionStorage } from '@bacons/apple-targets';
import {
  type FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useCourseLiveActivity } from '@/hooks/useCourseLiveActivity';

import View from '@/components/view';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import { queryCourseTable } from '@/request/api/course';
import {
  queryCurrentSemester,
  querySemesterList,
} from '@/request/api/semester';
import {
  courseLiveActivity,
  LIVE_ACTIVITY_ENABLED,
} from '@/utils/courseLiveActivity';
import { serializeCoursesForAppleWidget } from '@/utils/courseRuntime';
import {
  buildSemesterOptions,
  parseSemester,
  type SemesterOptionBase,
} from '@/utils/generateSemesterOptions';
import { log } from '@/utils/logger';
import {
  calculateSemesterWeekCount,
  calculateWeekFromStart,
  clampWeekToSemester,
} from '@/utils/semesterWeeks';

import CourseTable from './components/courseTable';
import type {
  courseType,
  SemesterWeekParams,
} from './components/courseTable/type';
import WeekSelector from './components/WeekSelector';

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const extensionStorage = useMemo(() => {
    return new ExtensionStorage('group.release-20240916');
  }, []);

  const { courses, updateCourses, setLastUpdate } = useCourse();
  const {
    semester,
    setSemester,
    year,
    setYear,
    selectedWeek,
    setSelectedWeek,
    setHolidayTime,
    setSchoolTime,
    showWeekPicker,
    setShowWeekPicker,
  } = useTimeStore();

  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);
  const [semesterOptions, setSemesterOptions] = useState<SemesterOptionBase[]>(
    []
  );
  const [currentSemester, setCurrentSemester] = useState<Pick<
    SemesterOptionBase,
    'year' | 'semester'
  > | null>(null);
  const [actualCurrentWeek, setActualCurrentWeek] = useState(1);

  const totalWeeks = useTimeStore(state => state.getSemesterWeekCount());

  const syncCoursesToWidget = useCallback(
    (nextCourses: courseType[]) => {
      extensionStorage.set(
        'courseTable',
        serializeCoursesForAppleWidget(nextCourses)
      );
      ExtensionStorage.reloadWidget();
    },
    [extensionStorage]
  );

  const applySemesterTime = useCallback(
    (option: SemesterOptionBase) => {
      setSchoolTime(option.startTimestamp);
      setHolidayTime(option.endTimestamp);
      extensionStorage.set('schoolTime', option.startTimestamp);
      extensionStorage.set('holidayTime', option.endTimestamp);
      ExtensionStorage.reloadWidget();
    },
    [extensionStorage, setHolidayTime, setSchoolTime]
  );

  const fetchSemesterInfo = useCallback(async () => {
    const [currentRes, listRes] = await Promise.all([
      queryCurrentSemester(),
      querySemesterList(),
    ]);
    const current = parseSemester(currentRes.data);
    const options = buildSemesterOptions(listRes.data ?? []);

    if (
      currentRes.code !== 0 ||
      listRes.code !== 0 ||
      !current ||
      options.length === 0
    ) {
      throw new Error('学期接口返回无效数据');
    }

    setSemesterOptions(options);
    setCurrentSemester({ year: current.year, semester: current.semester });
    setYear(current.year);
    setSemester(current.semester);
    applySemesterTime(current);

    const currentWeek = clampWeekToSemester(
      calculateWeekFromStart(current.startTimestamp),
      calculateSemesterWeekCount(current.startTimestamp, current.endTimestamp)
    );
    setActualCurrentWeek(currentWeek);
    setSelectedWeek(currentWeek);

    return current;
  }, [applySemesterTime, setSelectedWeek, setSemester, setYear]);

  const fetchTimetable = useCallback(
    async (
      targetYear: string,
      targetSemester: string,
      forceRefresh = false
    ) => {
      const res = await queryCourseTable({
        semester: targetSemester,
        year: targetYear,
        refresh: forceRefresh,
      });

      if (res?.code === 0 && res.data?.classes && res.data.last_refresh_time) {
        const nextCourses = res.data.classes as courseType[];
        updateCourses(nextCourses);
        syncCoursesToWidget(nextCourses);
        setLastUpdate(res.data.last_refresh_time);
      }
    },
    [setLastUpdate, syncCoursesToWidget, updateCourses]
  );

  const onTimetableRefresh = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        await fetchTimetable(year, semester, forceRefresh);
      } catch (error) {
        log.error('Failed to refresh timetable:', error);
      }
    },
    [fetchTimetable, semester, year]
  );

  const handleApply = useCallback(
    async ({
      year: newYear,
      semester: newSemester,
      week,
    }: SemesterWeekParams) => {
      const semesterChanged = newYear !== year || newSemester !== semester;
      setYear(newYear);
      setSemester(newSemester);
      const nextSemester = semesterOptions.find(
        option => option.year === newYear && option.semester === newSemester
      );
      if (nextSemester) applySemesterTime(nextSemester);
      if (week !== undefined) setSelectedWeek(week);

      if (semesterChanged) {
        setIsLoadingTimetable(true);
        try {
          await fetchTimetable(newYear, newSemester);
        } catch (error) {
          log.error('切换学期失败:', error);
        } finally {
          setIsLoadingTimetable(false);
        }
      }
      setShowWeekPicker(false);
    },
    [
      year,
      semester,
      setYear,
      setSemester,
      semesterOptions,
      applySemesterTime,
      setSelectedWeek,
      fetchTimetable,
      setShowWeekPicker,
    ]
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        const current = await fetchSemesterInfo();
        await fetchTimetable(current.year, current.semester);
      } catch (error) {
        log.error('Failed to initialize semester data:', error);
      }
    };

    void initialize();
  }, [fetchSemesterInfo, fetchTimetable]);

  useEffect(() => {
    setSelectedWeek(selectedWeek);
  }, [selectedWeek, setSelectedWeek, totalWeeks]);

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

    const classStartTime = new Date(Date.now() + 10 * 60 * 1000);
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
          totalWeeks={totalWeeks}
          year={year}
          semester={semester}
          semesterOptions={semesterOptions}
          currentSemester={currentSemester}
          actualCurrentWeek={actualCurrentWeek}
          onApply={handleApply}
          isLoading={isLoadingTimetable}
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
