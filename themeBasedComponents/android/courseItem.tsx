import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  colorOptions,
  COURSE_HEADER_HEIGHT,
  COURSE_HORIZONTAL_PADDING,
  COURSE_ITEM_HEIGHT,
} from '@/constants/courseTable';
import { CourseTransferType } from '@/module/courseTable/components/courseTable/type';

const CourseItem: React.FC<CourseTransferType> = props => {
  const { teacher, courseName, classroom, timeSpan, date } = props;
  return (
    <View
      style={{
        height:
          COURSE_ITEM_HEIGHT * (timeSpan ?? 2) - COURSE_HORIZONTAL_PADDING * 2,
        borderRadius: 5,
        backgroundColor: colorOptions.find(item => item.label === date)?.color,
      }}
    >
      <View style={[styles.cellView, { marginTop: 20 }]}>
        <Text style={styles.cellText}>{courseName || ''}</Text>
      </View>
      <View style={styles.cellView}>
        <Text style={styles.cellText}>{teacher || ''}</Text>
        <Text style={styles.cellText}>{classroom ? `@${classroom}` : ''}</Text>
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
  //for android
  cellView: {
    height: COURSE_HEADER_HEIGHT + 10,
    paddingLeft: 8,
    paddingRight: 8,
  },
});

export default CourseItem;
