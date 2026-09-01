import { ExtensionStorage } from '@bacons/apple-targets';
import {
  type FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View as NativeView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourseTableErrorBoundary from '@/components/CourseTableErrorBoundary';
import Toast from '@/components/toast';
import View from '@/components/view';
import { TABBAR_BASE_HEIGHT } from '@/constants/TABBAR';
import { useCourseLiveActivity } from '@/hooks/useCourseLiveActivity';
import { queryCourseTable } from '@/request/api/course';
import {
  queryCurrentSemester,
  querySemesterList,
} from '@/request/api/semester';
import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';
import { CourseDataError, parseCourseTableResponse } from '@/utils/courseData';
import {
  courseLiveActivity,
  LIVE_ACTIVITY_ENABLED,
} from '@/utils/courseLiveActivity';
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
import type { SemesterWeekParams } from './components/courseTable/type';
import WeekSelector from './components/WeekSelector';

type SemesterApiResponse = {
  code?: unknown;
  data?: unknown;
  msg?: unknown;
};

const getTimetableErrorMessage = (error: unknown) => {
  if (error instanceof CourseDataError) return error.message;
  if (error instanceof Error && /timeout/i.test(error.message)) {
    return '教务系统响应超时，请稍后重试';
  }
  return '网络连接异常，请检查网络后重试';
};

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const courseHydrated = useCourse(state => state.hydrated);
  const timeHydrated = useTimeStore(state => state.hydrated);
  const extensionStorage = useMemo(() => {
    return new ExtensionStorage('group.release-20240916');
  }, []);

  const {
    courses,
    lastUpdate,
    clearSemester,
    setActiveSemester,
    replaceSemesterCourses,
  } = useCourse();
  const {
    semester,
    year,
    selectedWeek,
    setSelectedWeek,
    setSemesterContext,
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
  const [timetableStatus, setTimetableStatus] = useState<
    'idle' | 'loading' | 'refreshing' | 'ready' | 'stale' | 'error'
  >('idle');
  const requestSequence = useRef(0);
  const initialized = useRef(false);

  const calendarWeekCount = useTimeStore(state => state.getSemesterWeekCount());
  const maxCourseWeek = useMemo(
    () =>
      courses.reduce(
        (maximum, course) =>
          Math.max(
            maximum,
            ...(Array.isArray(course.weeks) ? course.weeks : [])
          ),
        0
      ),
    [courses]
  );
  const totalWeeks = Math.max(calendarWeekCount, maxCourseWeek, 1);

  const applySemesterContext = useCallback(
    (option: SemesterOptionBase, week: number) => {
      const totalWeeks = calculateSemesterWeekCount(
        option.startTimestamp,
        option.endTimestamp
      );
      setSemesterContext({
        year: option.year,
        semester: option.semester,
        selectedWeek: clampWeekToSemester(week, totalWeeks),
        schoolTime: option.startTimestamp,
        holidayTime: option.endTimestamp,
      });
      setActiveSemester(option.year, option.semester);
      extensionStorage.set('schoolTime', option.startTimestamp);
      extensionStorage.set('holidayTime', option.endTimestamp);
      ExtensionStorage.reloadWidget();
    },
    [extensionStorage, setActiveSemester, setSemesterContext]
  );

  const fetchSemesterInfo = useCallback(async () => {
    const [currentResRaw, listResRaw] = await Promise.all([
      queryCurrentSemester(),
      querySemesterList(),
    ]);
    const currentRes = currentResRaw as unknown as SemesterApiResponse;
    const listRes = listResRaw as unknown as SemesterApiResponse;
    const current = parseSemester(
      currentRes.data as Parameters<typeof parseSemester>[0]
    );
    const options = buildSemesterOptions(
      (Array.isArray(listRes.data) ? listRes.data : []) as Parameters<
        typeof buildSemesterOptions
      >[0]
    );

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
    const currentWeek = clampWeekToSemester(
      calculateWeekFromStart(current.startTimestamp),
      calculateSemesterWeekCount(current.startTimestamp, current.endTimestamp)
    );
    applySemesterContext(current, currentWeek);
    setActualCurrentWeek(currentWeek);

    return current;
  }, [applySemesterContext]);

  const fetchTimetable = useCallback(
    async (
      targetYear: string,
      targetSemester: string,
      forceRefresh = false
    ) => {
      if (!targetYear || !targetSemester) {
        throw new CourseDataError('missing_scope', '学期信息尚未加载');
      }

      const requestId = ++requestSequence.current;
      const res = await queryCourseTable({
        semester: targetSemester,
        year: targetYear,
        refresh: forceRefresh,
      });

      const parsed = parseCourseTableResponse(res, {
        year: targetYear,
        semester: targetSemester,
      });

      if (requestId !== requestSequence.current) {
        return;
      }

      if (parsed.droppedCount > 0) {
        log.warn(`课表数据已忽略 ${parsed.droppedCount} 条异常课程`);
        Toast.show({
          text: `发现 ${parsed.droppedCount} 条异常课程，已安全忽略`,
          icon: 'fail',
        });
      }

      replaceSemesterCourses(
        targetYear,
        targetSemester,
        parsed.courses,
        parsed.lastRefreshTime
      );
    },
    [replaceSemesterCourses]
  );

  const onTimetableRefresh = useCallback(
    async (forceRefresh: boolean = false) => {
      setTimetableStatus(forceRefresh ? 'refreshing' : 'loading');
      try {
        await fetchTimetable(year, semester, forceRefresh);
        setTimetableStatus('ready');
      } catch (error) {
        setTimetableStatus(
          useCourse.getState().courses.length > 0 ? 'stale' : 'error'
        );
        log.error('Failed to refresh timetable:', error);
        throw error;
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
      const nextSemester = semesterOptions.find(
        option => option.year === newYear && option.semester === newSemester
      );
      if (!nextSemester) {
        Toast.show({ text: '学期信息无效，请重新选择', icon: 'fail' });
        return;
      }

      if (semesterChanged) {
        applySemesterContext(nextSemester, week ?? selectedWeek);
      } else if (week !== undefined) {
        setSelectedWeek(week);
      }

      if (semesterChanged) {
        setIsLoadingTimetable(true);
        setTimetableStatus('loading');
        try {
          await fetchTimetable(newYear, newSemester);
          setTimetableStatus('ready');
        } catch (error) {
          log.error('切换学期失败:', error);
          setTimetableStatus(
            useCourse.getState().courses.length > 0 ? 'stale' : 'error'
          );
          Toast.show({
            text: getTimetableErrorMessage(error),
            icon: 'fail',
          });
        } finally {
          setIsLoadingTimetable(false);
        }
      }
      setShowWeekPicker(false);
    },
    [
      year,
      semester,
      semesterOptions,
      applySemesterContext,
      selectedWeek,
      setSelectedWeek,
      fetchTimetable,
      setShowWeekPicker,
    ]
  );

  useEffect(() => {
    if (!courseHydrated || !timeHydrated || initialized.current) return;
    initialized.current = true;

    const initialize = async () => {
      let targetYear = useTimeStore.getState().year;
      let targetSemester = useTimeStore.getState().semester;

      try {
        const current = await fetchSemesterInfo();
        targetYear = current.year;
        targetSemester = current.semester;
      } catch (semesterError) {
        log.error('Failed to initialize semester metadata:', semesterError);
      }

      if (!targetYear || !targetSemester) {
        setTimetableStatus('error');
        Toast.show({
          text: '学期信息加载失败，请稍后重试',
          icon: 'fail',
        });
        return;
      }

      setActiveSemester(targetYear, targetSemester);
      setTimetableStatus('loading');
      try {
        await fetchTimetable(targetYear, targetSemester);
        setTimetableStatus('ready');
      } catch (error) {
        log.error('Failed to initialize timetable:', error);
        setTimetableStatus(
          useCourse.getState().courses.length > 0 ? 'stale' : 'error'
        );
        Toast.show({
          text: getTimetableErrorMessage(error),
          icon: 'fail',
        });
      }
    };

    void initialize();
  }, [
    courseHydrated,
    fetchSemesterInfo,
    fetchTimetable,
    setActiveSemester,
    timeHydrated,
  ]);

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

  const insets = useSafeAreaInsets();
  const tabbarHeight = TABBAR_BASE_HEIGHT + insets.bottom;

  return (
    <View
      style={[
        { flex: 1, paddingBottom: tabbarHeight, width: '100%' },
        currentStyle?.background_style,
      ]}
    >
      <CourseTableErrorBoundary
        key={`${year}-${semester}-${lastUpdate}`}
        onReset={() => {
          clearSemester(year, semester);
          void onTimetableRefresh(true).catch(() => undefined);
        }}
      >
        <CourseTable
          data={courses}
          onTimetableRefresh={onTimetableRefresh}
          currentWeek={selectedWeek}
        />
      </CourseTableErrorBoundary>
      {timetableStatus === 'loading' && courses.length === 0 && (
        <NativeView style={[styles.statusBanner, styles.topStatusBanner]}>
          <Text style={styles.statusText}>正在获取课表…</Text>
        </NativeView>
      )}
      {(timetableStatus === 'stale' ||
        (timetableStatus === 'error' && courses.length === 0)) && (
        <TouchableOpacity
          accessibilityHint="重新请求当前学期课表"
          accessibilityLabel="重新加载课表"
          accessibilityRole="button"
          activeOpacity={0.8}
          style={[
            styles.statusBanner,
            styles.retryBanner,
            { bottom: tabbarHeight + 20 },
          ]}
          onPress={() => {
            void onTimetableRefresh(true).catch(() => undefined);
          }}
        >
          <Text style={styles.statusText}>
            {timetableStatus === 'stale'
              ? '刷新失败，当前展示本地缓存 · '
              : '课表加载失败 · '}
            <Text style={styles.retryText}>点击重试</Text>
          </Text>
        </TouchableOpacity>
      )}
      {timetableStatus === 'ready' && courses.length === 0 && (
        <NativeView style={[styles.statusBanner, styles.topStatusBanner]}>
          <Text style={styles.statusText}>本学期暂无课程</Text>
        </NativeView>
      )}
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
  statusBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 200,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(40, 40, 40, 0.82)',
    minHeight: 48,
    justifyContent: 'center',
  },
  topStatusBanner: {
    top: 12,
  },
  retryBanner: {
    left: 16,
    right: 16,
  },
  statusText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  retryText: {
    fontWeight: '700',
  },
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
