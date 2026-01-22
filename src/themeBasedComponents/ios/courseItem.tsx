import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import {
  COURSE_HORIZONTAL_PADDING,
  COURSE_ITEM_HEIGHT,
  ITEM_COLORS,
} from '@/constants/SCHEDULE';
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
              ? ITEM_COLORS.find(item => item.label === date)?.color
              : ITEM_COLORS.find(item => item.label === '无')?.color,
            opacity: isThisWeek ? 1 : 0.4,
            borderRadius: 5,
            // minHeight: TOTAL_HEIGHT - COURSE_HEADER_HEIGHT,
            minHeight: 40,
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
            paddingLeft: 5,
            paddingRight: 5,
            opacity: isThisWeek ? 1 : 0.4,
          },
        ]}
      >
        <Text
          style={[
            styles.cellText,
            { color: '#0D0D0D', fontSize: 11, fontWeight: 'bold' },
            currentStyle?.text_style,
          ]}
          ellipsizeMode='tail'
          numberOfLines={2}
        >
          {teacher || ''}
        </Text>
        <Text
          style={[
            styles.cellText,
            { color: '#75757B', fontSize: 11, fontWeight: 'bold' },
          ]}
          ellipsizeMode='tail'
          numberOfLines={2}
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
