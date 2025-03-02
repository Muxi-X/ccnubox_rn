import { FC, memo, useEffect, useState } from 'react';

import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { queryCourseTable } from '@/request/api';

// eslint-disable-next-line import/namespace
import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const [courseData, setCourseData] = useState<courseType[]>([]);

  const onTimetableRefresh = async () => {
    queryCourseTable({
      semester: '1',
      week: 2,
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
      <CourseTable
        data={courseData}
        onTimetableRefresh={onTimetableRefresh}
      ></CourseTable>
    </View>
  );
};

export default memo(CourseTablePage);
