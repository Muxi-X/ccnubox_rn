import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ThemeChangeText from '@/components/text';

import useCourse from '@/store/course';
import useTimeStore from '@/store/time';
import useVisualScheme from '@/store/visualScheme';

import {
  COURSE_HEADER_HEIGHT,
  COURSE_ITEM_WIDTH,
  daysOfWeek,
} from '@/constants/courseTable';

export const StickyTop: React.FC = memo(function StickyTop() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const { selectedWeek } = useTimeStore();
  const schoolTime = useCourse(state => state.schoolTime);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const calculateDates = async () => {
      try {
        if (!schoolTime) {
          return;
        }

        // 计算开学日期
        const startTimestamp = schoolTime * 1000;
        const startDate = new Date(startTimestamp);

        // 计算当前周的第一天（周一）
        const daysToAdd = (selectedWeek - 1) * 7;
        const currentWeekStartDate = new Date(startDate);
        currentWeekStartDate.setDate(startDate.getDate() + daysToAdd);

        // 计算当前周的每一天
        const weekDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(currentWeekStartDate);
          date.setDate(currentWeekStartDate.getDate() + i);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          weekDates.push(`${month}/${day}`);
        }
        setDates(weekDates);
      } catch {
        throw new Error('计算日期失败');
      }
    };

    calculateDates();
  }, [selectedWeek, schoolTime]);

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {daysOfWeek.map((day, index) => (
          <View
            key={index}
            style={[
              styles.headerCell,
              currentStyle?.schedule_item_background_style,
              currentStyle?.schedule_border_style,
            ]}
          >
            <ThemeChangeText style={styles.headerText}>{day}</ThemeChangeText>
            <Text style={styles.dayText}>{dates[index] || ''}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    zIndex: 1,
    marginLeft: -1,
  },
  headerRow: {
    flexDirection: 'row',
  },
  headerCell: {
    width: COURSE_ITEM_WIDTH,
    height: COURSE_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
  },
  headerText: {
    fontWeight: 'bold',
  },
  dayText: {
    fontWeight: 'light',
    fontSize: 10,
    color: '#75757B',
    textAlign: 'center',
  },
});
