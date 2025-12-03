import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ThemeChangeText from '@/components/text';

import useCourseTableAppearance from '@/store/courseTableAppearance';
import useVisualScheme from '@/store/visualScheme';

import {
  COURSE_ITEM_HEIGHT,
  TIME_WIDTH,
  timeSlots,
} from '@/constants/courseTable';

export const StickyLeft: React.FC = memo(function StickyLeft() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const { backgroundUri } = useCourseTableAppearance();

  const timeSlotBackground = useMemo(() => {
    const flattened = StyleSheet.flatten(
      currentStyle?.schedule_item_background_style
    );
    if (!backgroundUri || !flattened) {
      return currentStyle?.schedule_item_background_style;
    }
    return { ...flattened, backgroundColor: 'transparent' };
  }, [currentStyle?.schedule_item_background_style, backgroundUri]);

  return (
    <>
      {timeSlots.map((time, index) => (
        <View
          key={index}
          style={[
            styles.timeSlot,
            timeSlotBackground,
            currentStyle?.schedule_border_style,
          ]}
        >
          <ThemeChangeText style={styles.countText}>
            {index + 1}
          </ThemeChangeText>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  timeSlot: {
    height: COURSE_ITEM_HEIGHT, // 每个时间槽的高度
    width: TIME_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  countText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
  },
  timeText: {
    fontWeight: 'light',
    fontSize: 10,
    paddingTop: 2,
    color: '#75757B',
    textAlign: 'center',
  },
});
