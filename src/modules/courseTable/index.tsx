import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import View from '@/components/view';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useUserStore from '@/store/user';
import useVisualScheme from '@/store/visualScheme';

import { queryCourseTable, queryCurrentWeek } from '@/request/api/course';
import { buildSemesterOptions } from '@/utils/generateSemesterOptions';
import { log } from '@/utils/logger';

import CourseTable from './components/courseTable';
import { courseType, SemesterWeekParams } from './components/courseTable/type';
import WeekSelector from './components/WeekSelector';

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

  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);

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

  // 应用学期/周次变更：更新状态，有学期变更则拉取课表，最后关闭选择器
  const handleApply = useCallback(
    async ({
      year: newYear,
      semester: newSemester,
      week,
    }: SemesterWeekParams) => {
      const semesterChanged = newYear !== year || newSemester !== semester;
      setYear(newYear);
      setSemester(newSemester);
      if (week !== undefined) setSelectedWeek(week);

      if (semesterChanged) {
        setIsLoadingTimetable(true);
        try {
          const res = await queryCourseTable({
            semester: newSemester,
            year: newYear,
            refresh: false,
          });
          if (
            res?.code === 0 &&
            res.data?.classes &&
            res.data.last_refresh_time
          ) {
            updateCourses(res.data.classes as courseType[]);
            setLastUpdate(res.data.last_refresh_time);
          }
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
      setSelectedWeek,
      updateCourses,
      setLastUpdate,
      setShowWeekPicker,
    ]
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
          year={year}
          semester={semester}
          semesterOptions={semesterOptions}
          onApply={handleApply}
          isLoading={isLoadingTimetable}
        />
      )}
    </View>
  );
};

export default memo(CourseTablePage);
