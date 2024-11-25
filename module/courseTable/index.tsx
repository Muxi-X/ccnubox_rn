import { FC, memo, useMemo } from 'react';

import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const data: courseType[] = useMemo(() => {
    return [
      { courseName: 'Math', time: '08:00', date: '一', timeSpan: 9 },
      { courseName: 'English', time: '10:10', date: '二', timeSpan: 3 },
      { courseName: 'Physics', time: '14:00', date: '四', timeSpan: 2 },
    ] as unknown as courseType[];
  }, []);
  return (
    <View
      style={[{ height: '95%', width: '100%' }, currentStyle?.background_style]}
    >
      <CourseTable data={data}></CourseTable>
    </View>
  );
};

export default memo(CourseTablePage);
