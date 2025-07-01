import { FC, memo, useCallback, useEffect } from 'react';

import View from '@/components/view';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import { queryCourseTable, queryCurrentWeek } from '@/request/api/course';
import { log } from '@/utils/logger';

import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';
import WeekSelector from './components/weekSelector';

// 根据开学日期计算当前周数，开学当天为第一周
const computeWeekNumber = (schoolTime: number): number => {
  const startTimestamp = schoolTime * 1000;
  const diffTime = new Date().getTime() - startTimestamp;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
};

// 根据开学时间计算学期和年份
const computeSemesterAndYear = (startTimestamp: number) => {
  const startDate = new Date(startTimestamp);
  const month = startDate.getMonth(); // 获取开学时间的月份
  let semester = '1'; // 默认学期为 '1'
  let year = new Date().getFullYear().toString(); // 默认年份为当前年

  // 根据开学时间计算学期和年份
  if (month >= 0 && month <= 5) {
    // 1月到5月 => 第二学期
    semester = '2';
    year = (new Date().getFullYear() - 1).toString(); // 前一年
  } else if (month >= 6 && month <= 7) {
    // 6月到7月 => 第三学期
    semester = '3';
    year = (new Date().getFullYear() - 1).toString(); // 前一年
  } else if (month >= 8 && month <= 11) {
    // 8月到12月 => 第一学期
    semester = '1';
    year = new Date().getFullYear().toString(); // 当前年
  }

  return { semester, year };
};

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

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
    currentWeek,
    setCurrentWeek,
    showWeekPicker,
    setShowWeekPicker,
  } = useTimeStore();

  // 刷新课程表数据，先从缓存中获取开学时间，若无则重新请求
  const onTimetableRefresh = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        if (semester === '' || year === '') {
          const { semester, year } = computeSemesterAndYear(schoolTime);
          setSemester(semester);
          setYear(year);
        }

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

  // 获取当前周数
  useEffect(() => {
    const fetchCurrentWeek = async () => {
      try {
        const res = await queryCurrentWeek();
        if (
          res?.code === 0 &&
          res.data?.school_time &&
          res.data?.holiday_time
        ) {
          setSchoolTime(res.data.school_time);
          setHolidayTime(res.data.holiday_time);
          setCurrentWeek(computeWeekNumber(res.data.school_time));
        }
      } catch (err) {
        log.error('Failed to fetch current week:', err);
      }
    };
    fetchCurrentWeek();
  }, [setSchoolTime, setHolidayTime, setCurrentWeek]);

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
        currentWeek={currentWeek}
      />
      {showWeekPicker && (
        <WeekSelector
          currentWeek={currentWeek}
          showWeekPicker={showWeekPicker}
          onWeekSelect={week => {
            setCurrentWeek(week);
            setShowWeekPicker(false);
          }}
        />
      )}
    </View>
  );
};

export default memo(CourseTablePage);
