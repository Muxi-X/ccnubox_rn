import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  colorOptions,
  COURSE_HEADER_HEIGHT,
  COURSE_HORIZONTAL_PADDING,
  COURSE_ITEM_HEIGHT,
} from '@/constants/courseTable';

import useVisualScheme from '@/store/visualScheme';

import { CourseTransferType } from '@/modules/courseTable/components/courseTable/type';

const CourseItem: React.FC<CourseTransferType> = props => {
  const { teacher, courseName, classroom, timeSpan, date, isThisWeek } = props;
  const { currentStyle } = useVisualScheme();
  const TOP_OFFSET = timeSpan === 1 ? 0 : 15
  const TOTAL_HEIGHT = COURSE_ITEM_HEIGHT * (timeSpan ?? 2) - COURSE_HORIZONTAL_PADDING * 2 - TOP_OFFSET
  //console.log('CourseItems', props);
  return (
    <View
      style={{
        top: TOP_OFFSET,
        height: TOTAL_HEIGHT,
      }}
    >
      <View
        style={[
          {
            paddingTop: timeSpan === 1 ? 5 : 10,
            paddingBottom: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isThisWeek
              ? colorOptions.find(item => item.label === date)?.color
              : colorOptions.find(item => item.label === '无')?.color,
            borderRadius: 5,
            minHeight: TOTAL_HEIGHT - COURSE_HEADER_HEIGHT,
          },
        ]}
      >
        <Text style={styles.cellText} ellipsizeMode="tail" numberOfLines={3}>{courseName}</Text>
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
            currentStyle?.text_style,
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
    textAlign: 'center',
  },
});

export default CourseItem;
