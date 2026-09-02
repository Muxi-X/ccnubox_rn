import type { courseType } from '@/modules/courseTable/components/courseTable/type';
import { parseClassWhen } from '@/utils/courseRuntime';

const MAX_REASONABLE_WEEK = 60;

type UnknownRecord = Record<string, unknown>;

export interface CourseScope {
  semester: string;
  year: string;
}

export interface SanitizedCourseList {
  courses: courseType[];
  droppedCount: number;
}

export interface ParsedCourseTableResponse extends SanitizedCourseList {
  lastRefreshTime: number;
}

export class CourseDataError extends Error {
  readonly kind: 'invalid_payload' | 'missing_scope' | 'server';

  constructor(
    kind: 'invalid_payload' | 'missing_scope' | 'server',
    message: string
  ) {
    super(message);
    this.name = 'CourseDataError';
    this.kind = kind;
  }
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toTrimmedString = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.trim() || fallback;
};

const toInteger = (value: unknown): number | null => {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN;
  return Number.isInteger(parsed) ? parsed : null;
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const toBoolean = (value: unknown) => {
  if (value === true || value === 1 || value === 'true') return true;
  if (value === false || value === 0 || value === 'false') return false;
  return false;
};

const readLegacyWeeks = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const sanitizeWeeks = (value: unknown): number[] => {
  const weeks = readLegacyWeeks(value)
    .map(toInteger)
    .filter(
      (week): week is number =>
        week !== null && week >= 1 && week <= MAX_REASONABLE_WEEK
    );

  return [...new Set(weeks)].sort((left, right) => left - right);
};

export const buildWeekDuration = (weeks: number[]) => {
  if (weeks.length === 0) return '';
  if (weeks.length === 1) return `${weeks[0]}周`;

  const isContinuous = weeks.every(
    (week, index) => index === 0 || week === weeks[index - 1] + 1
  );
  return isContinuous
    ? `${weeks[0]}-${weeks[weeks.length - 1]}周`
    : `${weeks.join(',')}周`;
};

export const isValidCourseScope = (year: unknown, semester: unknown): boolean =>
  typeof year === 'string' &&
  /^\d{4}$/.test(year) &&
  typeof semester === 'string' &&
  /^[123]$/.test(semester);

export const getCourseScopeKey = (year: string, semester: string) =>
  `${year}-${semester}` as const;

export const sanitizeCourse = (
  value: unknown,
  expectedScope?: CourseScope
): courseType | null => {
  if (!isRecord(value)) return null;

  const id = toTrimmedString(value.id);
  const classname = toTrimmedString(value.classname);
  const year = toTrimmedString(value.year);
  const semester = toTrimmedString(value.semester);
  const day = toInteger(value.day);
  const parsedRange = parseClassWhen(value.class_when);
  const weeks = sanitizeWeeks(value.weeks);

  if (
    !id ||
    !classname ||
    !isValidCourseScope(year, semester) ||
    day === null ||
    day < 1 ||
    day > 7 ||
    !parsedRange ||
    weeks.length === 0
  ) {
    return null;
  }

  if (
    expectedScope &&
    (year !== expectedScope.year || semester !== expectedScope.semester)
  ) {
    return null;
  }

  const weekDuration = toTrimmedString(value.week_duration);

  return {
    id,
    classname,
    teacher: toTrimmedString(value.teacher, '未知教师'),
    where: toTrimmedString(value.where, '未知地点'),
    day,
    class_when: `${parsedRange.startSection}-${parsedRange.endSection}`,
    weeks,
    week_duration: weekDuration || buildWeekDuration(weeks),
    credit: toFiniteNumber(value.credit),
    semester,
    year,
    note: toTrimmedString(value.note),
    nature: toTrimmedString(
      value.nature,
      toBoolean(value.is_official) ? '' : '自定义课程'
    ),
    is_official: toBoolean(value.is_official),
  };
};

export const sanitizeCourseList = (
  value: unknown,
  expectedScope?: CourseScope
): SanitizedCourseList => {
  if (!Array.isArray(value)) return { courses: [], droppedCount: 0 };

  const courses: courseType[] = [];
  const seenIds = new Set<string>();
  let droppedCount = 0;

  for (const rawCourse of value) {
    const course = sanitizeCourse(rawCourse, expectedScope);
    if (!course || seenIds.has(course.id)) {
      droppedCount += 1;
      continue;
    }
    seenIds.add(course.id);
    courses.push(course);
  }

  return { courses, droppedCount };
};

export const parseCourseTableResponse = (
  response: unknown,
  expectedScope: CourseScope
): ParsedCourseTableResponse => {
  if (!isValidCourseScope(expectedScope.year, expectedScope.semester)) {
    throw new CourseDataError('missing_scope', '学期信息无效');
  }
  if (!isRecord(response)) {
    throw new CourseDataError('invalid_payload', '课表接口响应不是对象');
  }
  if (response.code !== 0) {
    throw new CourseDataError(
      'server',
      toTrimmedString(response.msg, '课表接口返回失败')
    );
  }
  if (!isRecord(response.data) || !Array.isArray(response.data.classes)) {
    throw new CourseDataError('invalid_payload', '课表接口缺少课程数组');
  }

  const lastRefreshTime = toFiniteNumber(
    response.data.last_refresh_time,
    Number.NaN
  );
  if (!Number.isFinite(lastRefreshTime)) {
    throw new CourseDataError('invalid_payload', '课表刷新时间无效');
  }

  const sanitized = sanitizeCourseList(response.data.classes, expectedScope);
  if (response.data.classes.length > 0 && sanitized.courses.length === 0) {
    throw new CourseDataError('invalid_payload', '课表课程全部无效');
  }

  return { ...sanitized, lastRefreshTime };
};
