import type { courseType } from '@/modules/courseTable/components/courseTable/type';

type SectionTimeTuple = [hour: number, minute: number];

export interface SectionSchedule {
  section: number;
  start: SectionTimeTuple;
  startText: string;
  endText: string;
}

export interface ParsedClassWhen {
  endSection: number;
  startSection: number;
}

export interface IndexedCourse {
  course: courseType;
  endSection: number;
  startSection: number;
}

export const SECTION_SCHEDULE: SectionSchedule[] = [
  { section: 1, start: [8, 0], startText: '08:00', endText: '08:45' },
  { section: 2, start: [8, 55], startText: '08:55', endText: '09:40' },
  { section: 3, start: [10, 10], startText: '10:10', endText: '10:55' },
  { section: 4, start: [11, 5], startText: '11:05', endText: '11:50' },
  { section: 5, start: [14, 0], startText: '14:00', endText: '14:45' },
  { section: 6, start: [14, 55], startText: '14:55', endText: '15:40' },
  { section: 7, start: [16, 10], startText: '16:10', endText: '16:55' },
  { section: 8, start: [17, 5], startText: '17:05', endText: '17:50' },
  { section: 9, start: [18, 30], startText: '18:30', endText: '19:15' },
  { section: 10, start: [19, 20], startText: '19:20', endText: '20:05' },
  { section: 11, start: [20, 15], startText: '20:15', endText: '21:00' },
  { section: 12, start: [21, 5], startText: '21:05', endText: '21:50' },
];

const sectionScheduleByNumber = new Map(
  SECTION_SCHEDULE.map(item => [item.section, item])
);

export const parseClassWhen = (classWhen: string): ParsedClassWhen | null => {
  const [rawStartSection, rawEndSection] = classWhen.split('-');
  const startSection = Number(rawStartSection);
  const endSection = Number(rawEndSection ?? rawStartSection);

  if (!Number.isInteger(startSection) || !Number.isInteger(endSection)) {
    return null;
  }

  return {
    startSection,
    endSection,
  };
};

export const getSectionSchedule = (section: number): SectionSchedule | null => {
  return sectionScheduleByNumber.get(section) ?? null;
};

export function getClassTimeRange(classWhen: string): {
  end: string;
  start: string;
} {
  const parsed = parseClassWhen(classWhen);
  const startSchedule = getSectionSchedule(parsed?.startSection ?? 1);
  const endSchedule = getSectionSchedule(parsed?.endSection ?? 1);

  return {
    start: startSchedule?.startText ?? '00:00',
    end: endSchedule?.endText ?? '00:00',
  };
}

export function getClassStartTime(
  classWhen: string,
  referenceDate: Date = new Date()
): Date {
  const parsed = parseClassWhen(classWhen);
  const schedule = getSectionSchedule(parsed?.startSection ?? 1);
  const [hour, minute] = schedule?.start ?? [8, 0];

  return new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    hour,
    minute,
    0
  );
}

export function calculateMinutesUntilClass(
  classWhen: string,
  referenceDate: Date = new Date()
): number {
  const classStartTime = getClassStartTime(classWhen, referenceDate);
  const diffMs = classStartTime.getTime() - referenceDate.getTime();
  return Math.ceil(diffMs / (1000 * 60));
}

export const buildCoursesByDay = (
  courses: courseType[]
): Record<number, IndexedCourse[]> => {
  const indexedCourses: Record<number, IndexedCourse[]> = {};

  for (const course of courses) {
    const parsed = parseClassWhen(course.class_when);
    if (!parsed) continue;

    const dayCourses = indexedCourses[course.day] ?? [];
    dayCourses.push({
      course,
      startSection: parsed.startSection,
      endSection: parsed.endSection,
    });
    indexedCourses[course.day] = dayCourses;
  }

  for (const day of Object.keys(indexedCourses)) {
    indexedCourses[Number(day)].sort(
      (left, right) => left.startSection - right.startSection
    );
  }

  return indexedCourses;
};

export const serializeCoursesForAppleWidget = (courses: courseType[]) => {
  return courses.map(course => ({
    ...course,
    is_official: course.is_official ? 1 : 0,
    weeks: JSON.stringify(course.weeks),
  }));
};

export const buildAndroidWidgetCourseData = (
  courses: courseType[],
  currentWeek: number
) => {
  return {
    date: `第${currentWeek}周`,
    courses: courses.map(course => ({
      id: course.id,
    })),
  };
};
