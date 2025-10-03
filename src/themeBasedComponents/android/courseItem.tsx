import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  colorOptions,
  COURSE_HEADER_HEIGHT,
  COURSE_HORIZONTAL_PADDING,
  COURSE_ITEM_HEIGHT,
} from '@/constants/courseTable';
import { CourseTransferType } from '@/modules/courseTable/components/courseTable/type';

const CourseItem: React.FC<CourseTransferType> = props => {
  const { teacher, courseName, classroom, timeSpan, date, isThisWeek } = props;
  return (
    <View
      style={{
        height:
          COURSE_ITEM_HEIGHT * (timeSpan ?? 2) - COURSE_HORIZONTAL_PADDING * 2,
        borderRadius: 5,
        backgroundColor: isThisWeek
          ? colorOptions.find(item => item.label === date)?.color
          : colorOptions.find(item => item.label === '无')?.color,
        opacity: isThisWeek ? 1 : 0.4,
      }}
    >
      <View
        style={[
          styles.cellView,
          {
            // marginTop: timeSpan === 1 ? 0 : 20,
            marginTop: 15,
            height:
              timeSpan === 1
                ? COURSE_HEADER_HEIGHT - 10
                : COURSE_HEADER_HEIGHT + 10,
          },
        ]}
      >
        <Text style={styles.cellText} ellipsizeMode="tail" numberOfLines={3}>
          {courseName || ''}
        </Text>
      </View>
      <View style={styles.cellView}>
        <Text style={styles.cellText} ellipsizeMode='tail' numberOfLines={2}>{teacher || ''}</Text>
        <Text style={styles.cellText} ellipsizeMode='tail' numberOfLines={2}>{classroom ? `@${classroom}` : ''}</Text>
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
