import React, { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import Modal from '@/components/modal';

import useThemeBasedComponents from '@/store/themeBasedComponents';

import {
  COURSE_HORIZONTAL_PADDING,
  COURSE_ITEM_HEIGHT,
  COURSE_ITEM_WIDTH,
  COURSE_VERTICAL_PADDING,
  DAYS_OF_WEEK,
} from '@/constants/SCHEDULE';

import ModalContent from './ModalContent';
import { CourseTransferType, courseType } from './type';

type CourseContentProps = CourseTransferType & {
  originalData: courseType[];
  currentWeek: number;
  visibleIds: string[]; // visibleIds缓存当前显示的课程id，加入这个是因为某些神秘bug
};

// 课程内容组件
const CourseContent: React.FC<CourseContentProps> = memo(
  function CourseContent(props) {
    const { class_when, originalData, currentWeek } = props;

    const CourseItem = useThemeBasedComponents(
      state => state.CurrentComponents?.CourseItem
    );

    // 解析课程范围
    function parseRange(str: string) {
      const [start, end] = str.split('-').map(Number);
      return { start, end };
    }

    // 缓存当前的范围
    const currRange = useMemo(() => parseRange(class_when), [class_when]);

    // 现在slotCourses在课表重叠的时候会全包含
    // (比如之前在课程重叠时，点击1-4只包含1-4的信息，现在1-4会额外包含1-2和3-4的信息)
    const slotCourses = useMemo(() => {
      return originalData.filter(c => {
        if (c.day - 1 !== props.colIndex) return false;

        const { start, end } = parseRange(c.class_when);
        return !(end < currRange.start || start > currRange.end);
      });
    }, [originalData, props.colIndex, currRange]);

    // 在长课程重叠短课程且均为非本周的情况下，因为背景色的问题，会导致重叠后颜色变深
    // 所以这里判断是否其它课程完全覆盖了当前课程的时间段，且当前课程非本周
    // 如果是那么就不渲染当前课程，规避背景色问题
    const visibleIdSet = useMemo(
      () => new Set(props.visibleIds),
      [props.visibleIds]
    );
    const isCoveredAndNotInCurrWeek = useMemo(() => {
      return slotCourses.some(c => {
        if (c.id === props.id) return false;

        const { start, end } = parseRange(c.class_when);
        const isFullCovers =
          start <= currRange.start &&
          end >= currRange.end &&
          (start < currRange.start || end > currRange.end);

        const isCoveringRendered = visibleIdSet.has(c.id); // 覆盖当前课程的课程也必须被显示
        return !props.isThisWeek && isFullCovers && isCoveringRendered;
      });
    }, [slotCourses, props.id, props.isThisWeek, currRange, visibleIdSet]);

    const isRender = slotCourses.length <= 1 || !isCoveredAndNotInCurrWeek;

    const renderCourse = (c: courseType, idx: number) => (
      <View
        key={c.id}
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
          date={DAYS_OF_WEEK[props.colIndex]}
          is_official={c.is_official}
        />
      </View>
    );

    return (
      <>
        <Pressable
          style={{
            position: 'absolute',
            width: styles.cell.width - COURSE_HORIZONTAL_PADDING * 2,
            zIndex:
              100 -
              props.rowIndex +
              (slotCourses.length > 1 && props.isThisWeek ? 100 : 0),
            height: 'auto',
            top: COURSE_VERTICAL_PADDING + COURSE_ITEM_HEIGHT * props.rowIndex,
            left:
              COURSE_HORIZONTAL_PADDING + COURSE_ITEM_WIDTH * props.colIndex,
          }}
          onPress={() => {
            Modal.show({
              isTransparent: true,
              // 这里的三元是因为前面去掉了高度，如果统一放在ScollView中会导致单个课表在垂直方向上居上，因此独立出来
              children: (
                <View
                  style={{
                    minHeight: 220,
                    // height: slotCourses.length * 260 + 30,
                    maxHeight: 600,
                  }} // 这里固定高度会导致用户打开备注时课表高度超出容器，加上滚动条也需要向下滚动，感觉体验不太好，所以去掉了
                >
                  {slotCourses.length > 1 ? (
                    <ScrollView style={{ width: '100%' }}>
                      {slotCourses.map((c, i) => renderCourse(c, i))}
                    </ScrollView>
                  ) : (
                    slotCourses.map((c, i) => renderCourse(c, i))
                  )}
                </View>
              ),
              mode: 'middle',
            });
          }}
        >
          {CourseItem && isRender ? <CourseItem {...props} /> : null}
          {slotCourses.length > 1 && isRender && (
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
