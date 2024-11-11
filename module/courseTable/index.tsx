import { FC, memo, useMemo } from 'react';

import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import CourseTable from './components/courseTable';

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const data = useMemo(() => {
    return [
      { courseName: 'Math', time: '08:00', date: 'Mon' },
      { courseName: 'English', time: '10:00', date: 'Tue' },
      { courseName: 'Physics', time: '14:00', date: 'Wed' },
    ];
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
