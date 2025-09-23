import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import Modal from '@/components/modal';

import useThemeBasedComponents from '@/store/themeBasedComponents';

import {
  COURSE_HORIZONTAL_PADDING,
  COURSE_ITEM_HEIGHT,
  COURSE_ITEM_WIDTH,
  COURSE_VERTICAL_PADDING,
  daysOfWeek,
} from '@/constants/courseTable';

import ModalContent from './ModalContent';
import { CourseTransferType, courseType } from './type';

type CourseContentProps = CourseTransferType & {
  originalData: courseType[];
  currentWeek: number;
};

// 课程内容组件
const CourseContent: React.FC<CourseContentProps> = memo(
  function CourseContent(props) {
    const { class_when, originalData, currentWeek } = props;

    const CourseItem = useThemeBasedComponents(
      state => state.CurrentComponents?.CourseItem
    );

    const slotCourses = React.useMemo(
      () =>
        originalData.filter(
          c => c.day - 1 === props.colIndex && c.class_when === class_when
        ),
      [originalData, props.colIndex, class_when]
    );

    return (
      <>
        <Pressable
          style={{
            position: 'absolute',
            width: styles.cell.width - COURSE_HORIZONTAL_PADDING * 2,
            zIndex: 99,
            height: 'auto',
            top: COURSE_VERTICAL_PADDING + COURSE_ITEM_HEIGHT * props.rowIndex,
            left:
              COURSE_HORIZONTAL_PADDING + COURSE_ITEM_WIDTH * props.colIndex,
          }}
          onPress={() => {
            Modal.show({
              isTransparent: true,
              children: (
                <View
                  style={{
                    minHeight: 220,
                    height: slotCourses.length * 260,
                    maxHeight: 600,
                  }}
                >
                  <ScrollView style={{ width: '100%' }}>
                    {slotCourses.map((c, idx) => (
                      <View
                        key={`${c.id}`}
                        style={{
                          marginBottom: idx === slotCourses.length - 1 ? 0 : 12,
                        }}
                      >
                        <ModalContent
                          id={c.id}
                          class_when={c.class_when}
                          isThisWeek={c.weeks.includes(currentWeek)}
                          courseName={c.classname}
                          teacher={c.teacher}
                          classroom={c.where}
                          week_duration={c.week_duration}
                          credit={c.credit}
                          date={daysOfWeek[props.colIndex]}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ),
              mode: 'middle',
            });
          }}
        >
          {CourseItem && <CourseItem {...props}></CourseItem>}
          {slotCourses.length > 1 && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#FF4D4F',
                zIndex: 100,
              }}
            />
          )}
        </Pressable>
      </>
    );
  }
);

const styles = StyleSheet.create({
  cell: {
    width: COURSE_ITEM_WIDTH,
  },
});

export default CourseContent;
