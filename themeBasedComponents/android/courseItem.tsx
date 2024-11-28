import { StyleSheet, Text, View } from 'react-native';
import { colorOptions, COURSE_HEADER_HEIGHT } from '@/constants/courseTable';
import React from 'react';
import { CourseTransferType } from '@/module/courseTable/components/courseTable/type';

const CourseItem: React.FC<CourseTransferType> = props => {
  const { teacher, colIndex, rowIndex, courseName, classroom, timeSpan } =
    props;
  return (
    <>
      <View style={[styles.cellView, { marginTop: 20 }]}>
        <Text style={styles.cellText}>{courseName || ''}</Text>
      </View>
      <View style={styles.cellView}>
        <Text style={styles.cellText}>{teacher || ''}</Text>
        <Text style={styles.cellText}>{classroom ? `@${classroom}` : ''}</Text>
      </View>
    </>
  );
};

export const styles = StyleSheet.create({
  cellText: {
    fontSize: 11,
    color: 'white',
    textAlign: 'left',
  },
  //for android
  cellView: {
    height: COURSE_HEADER_HEIGHT + 10,
    paddingLeft: 8,
    paddingRight: 8,
  },
});

export default CourseItem;
