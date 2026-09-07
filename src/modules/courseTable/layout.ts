import { parseClassWhen } from '@/utils/courseRuntime';

import { DAYS_OF_WEEK, TIME_SLOTS } from './constants';
import type { CourseTransferType, courseType } from './types';

export function buildTimetableLayout(data: courseType[], currentWeek: number) {
  const timetableMatrix: ({ classname: string; timeSpan: number } | null)[][] =
    TIME_SLOTS.map(() => Array(DAYS_OF_WEEK.length).fill(null));
  const courses: CourseTransferType[] = [];
  const coursesBySlot = new Map<string, CourseTransferType[]>();
  const idxMap = new Map<string, number>();

  (Array.isArray(data) ? data : []).forEach((course, idx) => {
    const {
      id,
      day,
      teacher,
      where,
      class_when,
      classname,
      weeks,
      week_duration,
      credit,
      note,
      is_official,
    } = course;
    const parsedRange = parseClassWhen(class_when);
    const safeDay = Number(day);
    if (
      !parsedRange ||
      !Number.isInteger(safeDay) ||
      safeDay < 1 ||
      safeDay > DAYS_OF_WEEK.length
    ) {
      return;
    }

    idxMap.set(course.id, idx);
    const timeSpan = parsedRange.endSection - parsedRange.startSection + 1;
    const rowIndex = parsedRange.startSection - 1;
    const colIndex = safeDay - 1;
    const key = `${rowIndex}-${colIndex}`;

    if (
      rowIndex >= 0 &&
      rowIndex < timetableMatrix.length &&
      colIndex >= 0 &&
      colIndex < DAYS_OF_WEEK.length
    ) {
      const slotCourses = coursesBySlot.get(key) ?? [];
      slotCourses.push({
        id,
        courseName: classname,
        timeSpan,
        teacher,
        date: DAYS_OF_WEEK[colIndex],
        classroom: where,
        rowIndex,
        colIndex,
        weeks: Array.isArray(weeks) ? weeks : [],
        isThisWeek: Array.isArray(weeks) && weeks.includes(currentWeek),
        week_duration,
        credit,
        class_when,
        note,
        is_official,
      });
      coursesBySlot.set(key, slotCourses);
    }
  });

  for (const [key, slotCourses] of coursesBySlot) {
    const [rowIndex, colIndex] = key.split('-').map(Number);
    // 保留原有加权规则和输入顺序，包括相同 id 使用最后一次索引的行为。
    const getPriority = (course: CourseTransferType) => {
      const idx = idxMap.get(course.id) || 0;
      const base = (course.isThisWeek ? 2 : 0) + (!course.is_official ? 1 : 0);
      return base * 100 + idx;
    };
    const sorted = slotCourses
      .slice()
      .sort((a, b) => getPriority(b) - getPriority(a));
    const courseToShow = sorted[0] ?? null;

    if (courseToShow) {
      const row = timetableMatrix[rowIndex];
      if (!row || colIndex < 0 || colIndex >= row.length) continue;
      row[colIndex] = {
        classname: courseToShow.courseName,
        timeSpan: courseToShow.timeSpan,
      };
      courses.push(courseToShow);
    }
  }

  return {
    timetableMatrix,
    courses,
    visibleIds: courses.map(course => course.id),
  };
}
