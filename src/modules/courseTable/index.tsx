import { FC, memo, useCallback, useEffect } from 'react';

import View from '@/components/view';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import { queryCourseTable, queryCurrentWeek } from '@/request/api/course';
import { getSemesterAndYear } from '@/utils/getSemesterAndYear';
import { log } from '@/utils/logger';

import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';
import WeekSelector from './components/weekSelector';

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
    selectedWeek,
    setSelectedWeek,
    showWeekPicker,
    setShowWeekPicker,
  } = useTimeStore();

  const fetchCurrentWeek = async () => {
    try {
      const res = await queryCurrentWeek();
      if (res?.code === 0 && res.data?.school_time && res.data?.holiday_time) {
        setSchoolTime(res.data.school_time);
        setHolidayTime(res.data.holiday_time);
        const { semester, year } = getSemesterAndYear(res.data.school_time);
        setSemester(semester);
        setYear(year);
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
        />
      )}
    </View>
  );
};

export default memo(CourseTablePage);
