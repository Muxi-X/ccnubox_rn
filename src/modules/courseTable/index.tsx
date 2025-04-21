import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as SecureStore from 'expo-secure-store';
import { FC, memo, useEffect, useState } from 'react';

import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';
import useWeekStore from '@/store/weekStore';

import { queryCourseTable, queryCurrentWeek } from '@/request/api';

import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';
import WeekSelector from './components/weekSelector';

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const [courseData, setCourseData] = useState<courseType[]>([]);
  const { currentWeek, setCurrentWeek, showWeekPicker, setShowWeekPicker } =
    useWeekStore();

  // 根据开学日期计算当前周数，开学当天为第一周
  const computeWeekNumber = (schoolTime: string): number => {
    const startTimestamp = Number(schoolTime) * 1000;
    const diffTime = new Date().getTime() - startTimestamp;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  };

  // 从缓存中获取 school_time，如不存在或强制刷新时则调用接口并缓存
  const getCachedSchoolTime = async (
    forceRefresh: boolean = false
  ): Promise<string | null> => {
    let schoolTime: string | null = null;
    let holiday_time: string | null = null;
    if (!forceRefresh) {
      schoolTime = await AsyncStorage.getItem('school_time');
      holiday_time = await AsyncStorage.getItem('holiday_time');
    }
    if (!schoolTime || !holiday_time || forceRefresh) {
      const res = await queryCurrentWeek();
      if (res?.code === 0 && res.data?.school_time && res.data?.holiday_time) {
        schoolTime = String(res.data.school_time);
        holiday_time = String(res.data.holiday_time);
        await AsyncStorage.setItem('school_time', schoolTime);
        await AsyncStorage.setItem('holiday_time', holiday_time);
      }
    }
    return schoolTime;
  };

  // 读取缓存的课表数据
  const getCachedCourseTable = async (): Promise<courseType[] | null> => {
    const dataString = await AsyncStorage.getItem('course_table');
    if (dataString) {
      try {
        const data = JSON.parse(dataString);
        return Array.isArray(data) ? data : null;
      } catch (error) {
        console.error('解析缓存数据失败:', error);
      }
    }
    return null;
  };

  // 刷新课程表数据，先从缓存中获取开学时间，若无则重新请求
  const onTimetableRefresh = async (forceRefresh: boolean = false) => {
    try {
      // 如果不需要强制刷新，则先尝试从缓存中读取课表数据
      if (!forceRefresh) {
        const cachedData = await getCachedCourseTable();
        if (cachedData && cachedData.length > 0) {
          setCourseData(cachedData);
          return;
        }
      }

      // 获取开学时间（用于计算当前周和学期信息）
      const schoolTime = await getCachedSchoolTime(forceRefresh);
      if (!schoolTime) return;

      let semester = '1'; // 默认学期为 '1'
      let year = new Date().getFullYear().toString(); // 默认年份为当前年

      const startTimestamp = Number(schoolTime) * 1000;
      const startDate = new Date(startTimestamp);
      const month = startDate.getMonth(); // 获取开学时间的月份

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

      // 使用计算得到的学期和年份
      const res = await queryCourseTable({
        semester,
        year,
        refresh: forceRefresh,
      });

      if (res?.code === 0) {
        const courses = res.data?.classes as courseType[];
        // 缓存课表
        await AsyncStorage.setItem('course_table', JSON.stringify(courses));
        setCourseData(courses);
      }
    } catch (error) {
      console.error('onTimetableRefresh error:', error);
    }
  };

  useEffect(() => {
    (async () => {
      // 获取并缓存开学时间
      const schoolTime = await getCachedSchoolTime();
      if (schoolTime) {
        setCurrentWeek(computeWeekNumber(schoolTime));
      }
      await onTimetableRefresh();
    })();
  }, []);

  return (
    <View
      style={[
        { height: '120%', width: '100%' },
        currentStyle?.background_style,
      ]}
    >
      <CourseTable
        data={courseData}
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
