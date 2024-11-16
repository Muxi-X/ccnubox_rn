import { FC, memo, useMemo } from 'react';

import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const data: courseType[] = useMemo(() => {
    return [
      { courseName: 'Math', time: '12:00', date: 'Mon', timeSpan: 9 },
      { courseName: 'English', time: '18:00', date: 'Tue', timeSpan: 3 },
      { courseName: 'Physics', time: '14:00', date: 'Wed', timeSpan: 2 },
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
