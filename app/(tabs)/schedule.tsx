import { FC, memo } from 'react';
import { View } from 'react-native';

import CourseTable from '@/components/courseTable';

const MorePage: FC = () => {
  return (
    <View style={{ height: '95%', width: '100%' }}>
      <CourseTable
        data={[
          { courseName: 'Math', time: '08:00', date: 'Mon' },
          { courseName: 'English', time: '10:00', date: 'Tue' },
          { courseName: 'Physics', time: '14:00', date: 'Wed' },
        ]}
      ></CourseTable>
    </View>
  );
};

export default memo(MorePage);
