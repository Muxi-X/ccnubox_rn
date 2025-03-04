import { FC, memo, useEffect, useState } from 'react';

import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';
import useWeekStore from '@/store/weekStore';

import { queryCourseTable, queryCurrentWeek } from '@/request/api';
import { getCurrentTime } from '@/utils/getCurrentTime';

// eslint-disable-next-line import/namespace
import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';
const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const [courseData, setCourseData] = useState<courseType[]>([]);
  const { currentWeek, setCurrentWeek } = useWeekStore();
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  const onTimetableRefresh = async () => {
    queryCourseTable({
      semester: '2',
      week: parseInt(currentWeek),
      year: '2024',
      refresh: true,
    }).then(res => {
      if (res?.code === 0) {
        setCourseData(res.data?.classes as courseType[]);
      }
    });
  };
  const getCurrentWeek = async () => {
    queryCurrentWeek().then(res => {
      const week = getCurrentTime(
        res.data?.school_time as number,
        res.data?.holiday_time as number
      );
      setCurrentWeek(week.toString());
    });
  };
  useEffect(() => {
    void onTimetableRefresh();
    void getCurrentWeek();
  }, []);

  return (
    <View
      style={[{ height: '95%', width: '100%' }, currentStyle?.background_style]}
    >
      <CourseTable
        data={courseData}
        onTimetableRefresh={onTimetableRefresh}
        currentWeek={currentWeek}
        onToggleWeekPicker={() => setShowWeekPicker(!showWeekPicker)}
      />
    </View>
  );
};

export default memo(CourseTablePage);
