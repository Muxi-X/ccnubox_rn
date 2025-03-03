import { FC, memo, useEffect, useState } from 'react';

import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';
import useWeekStore from '@/store/weekStore';

import { queryCourseTable } from '@/request/api';

// eslint-disable-next-line import/namespace
import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';
import WeekSelector from './components/weekSelector';

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
    }).then(res => {
      if (res?.code === 0) {
        setCourseData(res.data?.classes as courseType[]);
      }
    });
  };

  useEffect(() => {
    void onTimetableRefresh();
  }, []);

  return (
    <View
      style={[{ height: '95%', width: '100%' }, currentStyle?.background_style]}
    >
      <WeekSelector
        currentWeek={currentWeek}
        showWeekPicker={showWeekPicker}
        onWeekSelect={week => {
          setCurrentWeek(week);
          setShowWeekPicker(false);
        }}
        onToggleWeekPicker={() => setShowWeekPicker(!showWeekPicker)}
      />
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
