import { FC, memo, useEffect, useMemo, useState } from 'react';

import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { request } from '@/request/request';

import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);

  const [courseData, setCourseData] = useState<courseType[]>([]);
  useEffect(() => {
    const asyncData = async () => {
      const res = await request.get(
        `/class/get?semester=${1}&week=${2}&year=${2024}` as '/class/get'
      );
      console.log('res', res);
      setCourseData(res.data?.classes as courseType[]);
    };
    void asyncData();
  }, []);

  return (
    <View
      style={[{ height: '95%', width: '100%' }, currentStyle?.background_style]}
    >
      <CourseTable data={courseData}></CourseTable>
    </View>
  );
};

export default memo(CourseTablePage);
