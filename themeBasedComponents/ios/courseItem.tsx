import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colorOptions, COURSE_HEADER_HEIGHT } from '@/constants/courseTable';
import { CourseTransferType } from '@/module/courseTable/components/courseTable/type';

const CourseItem: React.FC<CourseTransferType> = props => {
  const { teacher, colIndex, rowIndex, courseName, classroom, timeSpan } =
    props;
  return (
    <View
      style={{
        top: 15,
      }}>
      <View
        style={[
          {
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 6,
            backgroundColor:
              colorOptions[(rowIndex + colIndex) % colorOptions.length].color,
            borderRadius: 5,
          },
        ]}
      >
        <Text style={styles.cellText}>{courseName || ''}</Text>
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
