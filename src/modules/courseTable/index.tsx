import { FC, memo, useCallback, useEffect, useMemo } from 'react';

import View from '@/components/view';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useUserStore from '@/store/user';
import useVisualScheme from '@/store/visualScheme';

import { queryCourseTable, queryCurrentWeek } from '@/request/api/course';
import { log } from '@/utils/logger';

import CourseTable from './components/courseTable';
import { courseType, SemesterOption } from './components/courseTable/type';
import WeekSelector from './components/WeekSelector';

/** 根据学号前四位生成从入学到当前的学期列表 */
const buildSemesterOptions = (studentId: string): SemesterOption[] => {
  const admissionYear = Number(studentId.slice(0, 4));
  if (isNaN(admissionYear)) return [];

  const today = new Date();
  const currentCalendarYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // 当前学年：9 月起算新学年
  const currentAcademicYear =
    currentMonth >= 9 ? currentCalendarYear : currentCalendarYear - 1;

  // 当前学期
  let currentSemester = 1;
  if (currentMonth >= 2 && currentMonth <= 6) {
    currentSemester = 2;
  } else if (currentMonth >= 7 && currentMonth <= 8) {
    currentSemester = 3;
  }

  const semesterLabels: Record<string, string> = {
    '1': '第一学期',
    '2': '第二学期',
    '3': '第三学期',
  };

  const options: SemesterOption[] = [];
  for (let y = admissionYear; y <= currentAcademicYear; y++) {
    const isCurrentYear = y === currentAcademicYear;
    const maxSem = isCurrentYear ? currentSemester : 3;
    for (let s = 1; s <= maxSem; s++) {
      options.push({
        label: `${String(y).slice(2)}~${String(y + 1).slice(2)}学年-${semesterLabels[String(s)]}`,
        year: String(y),
        semester: String(s),
      });
    }
  }
  // 最新的在前面（index 0 = 最新学期）
  return options.reverse();
};

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const studentId = useUserStore(state => state.student_id);

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
    computeAndSetSemester,
  } = useTimeStore();

  // 根据学号生成学期列表
  const semesterOptions = useMemo(
    () => buildSemesterOptions(studentId),
    [studentId]
  );

  const fetchCurrentWeek = async () => {
    try {
      const res = await queryCurrentWeek();
      if (res?.code === 0 && res.data?.school_time && res.data?.holiday_time) {
        setSchoolTime(res.data.school_time);
        setHolidayTime(res.data.holiday_time);
        computeAndSetSemester(res.data.school_time);
        setTimeout(
          () => setSelectedWeek(useTimeStore.getState().getCurrentWeek()),
          0
        );
      }
    } catch (err) {
      log.error('Failed to fetch current week:', err);
    }
  };

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
          setLastUpdate(res.data.last_refresh_time);
        }
      } catch (error) {
        log.error('Failed to refresh timetable:', error);
      }
    },
    [schoolTime, updateCourses, setLastUpdate]
  );

  // 切换学期：更新 year/semester 后重新拉取课表
  const handleSemesterChange = useCallback(
    async (newYear: string, newSemester: string) => {
      setSemester(newSemester);
      setYear(newYear);
      try {
        const res = await queryCourseTable({
          semester: newSemester,
          year: newYear,
          refresh: true,
        });
        if (
          res?.code === 0 &&
          res.data?.classes &&
          res.data.last_refresh_time
        ) {
          const courses = res.data.classes as courseType[];
          updateCourses(courses);
          setLastUpdate(res.data.last_refresh_time);
        }
      } catch (error) {
        log.error('切换学期失败:', error);
      }
    },
    [setSemester, setYear, updateCourses, setLastUpdate]
  );

  // 获取当前周数
  useEffect(() => {
    fetchCurrentWeek();
  }, [setSchoolTime, setHolidayTime, setSelectedWeek]);

  // 刷新课表数据
  useEffect(() => {
    if (schoolTime) {
      onTimetableRefresh();
    }
  }, [schoolTime, onTimetableRefresh]);

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
          year={year}
          semester={semester}
          semesterOptions={semesterOptions}
          onClose={() => setShowWeekPicker(false)}
          onSemesterChange={handleSemesterChange}
        />
      )}
    </View>
  );
};

export default memo(CourseTablePage);
