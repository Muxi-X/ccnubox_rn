import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colorOptions } from '@/constants/courseTable';
import { CourseTransferType } from '@/modules/courseTable/components/courseTable/type';

const CourseItem: React.FC<CourseTransferType> = props => {
  const { teacher, courseName, classroom, timeSpan, date, isThisWeek } = props;
  console.log('CourseItems', props);
  return (
    <View
      style={{
        top: timeSpan === 1 ? 0 : 15,
      }}
    >
      <View
        style={[
          {
            paddingTop: timeSpan === 1 ? 5 : 10,
            paddingBottom: 10,
            alignItems: 'center',
            backgroundColor: isThisWeek
              ? colorOptions.find(item => item.label === date)?.color
              : colorOptions.find(item => item.label === '无')?.color,
            borderRadius: 5,
          },
        ]}
      >
        <Text style={styles.cellText}>{courseName}</Text>
      </View>
      <View
        style={[
          {
            alignItems: 'center',
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 10,
            paddingRight: 10,
          },
        ]}
      >
        <Text
          style={[
            styles.cellText,
            { color: '#0D0D0D', fontSize: 11, fontWeight: 'bold' },
          ]}
        >
          {teacher || ''}
        </Text>
        <Text
          style={[
            styles.cellText,
            { color: '#75757B', fontSize: 11, fontWeight: 'bold' },
          ]}
        >
          {classroom ? `@${classroom}` : ''}
        </Text>
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  cellText: {
    fontSize: 11,
    color: 'white',
    textAlign: 'left',
  },
});

export default CourseItem;
