import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { courseType } from '@/modules/courseTable/components/courseTable/type';
import {
  getCourseScopeKey,
  isValidCourseScope,
  sanitizeCourse,
  sanitizeCourseList,
} from '@/utils/courseData';
import { updateCourseWidgetData } from '@/utils/updateWidget';

const COURSE_STORE_VERSION = 2;

type CourseBuckets = Record<string, CourseBucket>;

export interface CourseBucket {
  courses: courseType[];
  fetchedAt: number;
  lastRefreshTime: number;
  semester: string;
  year: string;
}

interface PersistedCourseState {
  activeKey: string | null;
  buckets: CourseBuckets;
  courseCategories: string[];
}

interface CourseState extends PersistedCourseState {
  hydrated: boolean;
  rehydrateError: string | null;
  courses: courseType[];
  lastUpdate: number;
  setHydrated: (_hydrated: boolean, _error?: string | null) => void;
  setActiveSemester: (_year: string, _semester: string) => void;
  replaceSemesterCourses: (
    _year: string,
    _semester: string,
    _courses: unknown,
    _lastRefreshTime: number
  ) => void;
  clearSemester: (_year: string, _semester: string) => void;
  updateCourses: (_courses: courseType[]) => void;
  updatecourseCategories: (_coursesCategory: string[]) => void;
  addCourse: (_course: courseType) => void;
  deleteCourse: (_id: string) => void;
  updateCourseNote: (_id: string, _note: string) => void;
  setLastUpdate: (_time: number) => void;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toTimestamp = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;

const parseScopeKey = (key: unknown) => {
  if (typeof key !== 'string') return null;
  const match = /^(\d{4})-([123])$/.exec(key);
  return match ? { year: match[1], semester: match[2] } : null;
};

const createBucket = (
  year: string,
  semester: string,
  courses: unknown,
  lastRefreshTime: unknown,
  fetchedAt: unknown = Date.now()
): CourseBucket => ({
  year,
  semester,
  courses: sanitizeCourseList(courses, { year, semester }).courses,
  lastRefreshTime: toTimestamp(lastRefreshTime),
  fetchedAt: toTimestamp(fetchedAt) || Date.now(),
});

const normalizePersistedState = (value: unknown): PersistedCourseState => {
  const fallback: PersistedCourseState = {
    activeKey: null,
    buckets: {},
    courseCategories: [],
  };
  if (!isRecord(value)) return fallback;

  const buckets: CourseBuckets = {};
  if (isRecord(value.buckets)) {
    for (const [rawKey, rawBucket] of Object.entries(value.buckets)) {
      if (!isRecord(rawBucket)) continue;
      const keyScope = parseScopeKey(rawKey);
      const year =
        typeof rawBucket.year === 'string' ? rawBucket.year : keyScope?.year;
      const semester =
        typeof rawBucket.semester === 'string'
          ? rawBucket.semester
          : keyScope?.semester;
      if (
        typeof year !== 'string' ||
        typeof semester !== 'string' ||
        !isValidCourseScope(year, semester)
      ) {
        continue;
      }

      const key = getCourseScopeKey(year, semester);
      buckets[key] = createBucket(
        year,
        semester,
        rawBucket.courses,
        rawBucket.lastRefreshTime,
        rawBucket.fetchedAt
      );
    }
  } else if (Array.isArray(value.courses)) {
    const legacyCourses = sanitizeCourseList(value.courses).courses;
    for (const course of legacyCourses) {
      const key = getCourseScopeKey(course.year, course.semester);
      const bucket =
        buckets[key] ??
        createBucket(
          course.year,
          course.semester,
          [],
          value.lastUpdate,
          Date.now()
        );
      bucket.courses.push(course);
      buckets[key] = bucket;
    }
  }

  const requestedActiveKey =
    typeof value.activeKey === 'string' ? value.activeKey : null;
  const activeKey =
    requestedActiveKey && parseScopeKey(requestedActiveKey)
      ? requestedActiveKey
      : (Object.keys(buckets)[0] ?? null);

  return {
    activeKey,
    buckets,
    courseCategories: Array.isArray(value.courseCategories)
      ? value.courseCategories.filter(
          (category): category is string => typeof category === 'string'
        )
      : [],
  };
};

const getActiveSnapshot = (
  activeKey: string | null,
  buckets: CourseBuckets
) => {
  const bucket = activeKey ? buckets[activeKey] : undefined;
  return {
    courses: bucket?.courses ?? [],
    lastUpdate: bucket?.lastRefreshTime ?? 0,
  };
};

const syncWidget = (courses: courseType[]) => {
  void updateCourseWidgetData(courses).catch(() => undefined);
};

const useCourse = create<CourseState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      rehydrateError: null,
      activeKey: null,
      buckets: {},
      courses: [],
      courseCategories: [],
      lastUpdate: 0,
      setHydrated: (hydrated, error = null) =>
        set({ hydrated, rehydrateError: error }),
      setActiveSemester: (year, semester) => {
        if (!isValidCourseScope(year, semester)) return;
        const activeKey = getCourseScopeKey(year, semester);
        const snapshot = getActiveSnapshot(activeKey, get().buckets);
        set({ activeKey, ...snapshot });
        syncWidget(snapshot.courses);
      },
      replaceSemesterCourses: (year, semester, courses, lastRefreshTime) => {
        if (!isValidCourseScope(year, semester)) return;
        const key = getCourseScopeKey(year, semester);
        const bucket = createBucket(year, semester, courses, lastRefreshTime);
        const buckets = { ...get().buckets, [key]: bucket };
        const isActive = get().activeKey === key;
        set({
          buckets,
          ...(isActive
            ? { courses: bucket.courses, lastUpdate: bucket.lastRefreshTime }
            : {}),
        });
        if (isActive) syncWidget(bucket.courses);
      },
      clearSemester: (year, semester) => {
        if (!isValidCourseScope(year, semester)) return;
        const key = getCourseScopeKey(year, semester);
        const buckets = { ...get().buckets };
        delete buckets[key];
        const isActive = get().activeKey === key;
        set({
          buckets,
          ...(isActive ? { courses: [], lastUpdate: 0 } : {}),
        });
        if (isActive) syncWidget([]);
      },
      updateCourses: courses => {
        const sanitized = sanitizeCourseList(courses).courses;
        const scope = sanitized[0]
          ? { year: sanitized[0].year, semester: sanitized[0].semester }
          : parseScopeKey(get().activeKey);
        if (!scope) return;
        get().replaceSemesterCourses(
          scope.year,
          scope.semester,
          sanitized,
          get().lastUpdate
        );
      },
      updatecourseCategories: courseCategories =>
        set({
          courseCategories: courseCategories.filter(
            category => typeof category === 'string'
          ),
        }),
      addCourse: rawCourse => {
        const course = sanitizeCourse(rawCourse);
        if (!course) return;
        const key = getCourseScopeKey(course.year, course.semester);
        const existing = get().buckets[key];
        const nextCourses = sanitizeCourseList([
          ...(existing?.courses ?? []),
          course,
        ]).courses;
        const bucket = createBucket(
          course.year,
          course.semester,
          nextCourses,
          existing?.lastRefreshTime ?? 0,
          existing?.fetchedAt ?? Date.now()
        );
        const buckets = { ...get().buckets, [key]: bucket };
        const isActive = get().activeKey === key;
        set({
          buckets,
          ...(isActive ? { courses: bucket.courses } : {}),
        });
        if (isActive) syncWidget(bucket.courses);
      },
      deleteCourse: id => {
        const activeKey = get().activeKey;
        if (!activeKey) return;
        const bucket = get().buckets[activeKey];
        if (!bucket) return;
        const courses = bucket.courses.filter(course => course.id !== id);
        const nextBucket = { ...bucket, courses };
        set({
          buckets: { ...get().buckets, [activeKey]: nextBucket },
          courses,
        });
        syncWidget(courses);
      },
      updateCourseNote: (id, note) => {
        const activeKey = get().activeKey;
        if (!activeKey) return;
        const bucket = get().buckets[activeKey];
        if (!bucket) return;
        const courses = bucket.courses.map(course =>
          course.id === id ? { ...course, note } : course
        );
        set({
          buckets: {
            ...get().buckets,
            [activeKey]: { ...bucket, courses },
          },
          courses,
        });
        syncWidget(courses);
      },
      setLastUpdate: lastUpdate => {
        const activeKey = get().activeKey;
        if (!activeKey) return;
        const bucket = get().buckets[activeKey];
        if (!bucket) {
          set({ lastUpdate: toTimestamp(lastUpdate) });
          return;
        }
        const nextBucket = {
          ...bucket,
          lastRefreshTime: toTimestamp(lastUpdate),
        };
        set({
          buckets: { ...get().buckets, [activeKey]: nextBucket },
          lastUpdate: nextBucket.lastRefreshTime,
        });
      },
    }),
    {
      name: 'courses',
      version: COURSE_STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        activeKey: state.activeKey,
        buckets: state.buckets,
        courseCategories: state.courseCategories,
      }),
      migrate: persistedState => normalizePersistedState(persistedState),
      merge: (persistedState, currentState) => {
        const normalized = normalizePersistedState(persistedState);
        return {
          ...currentState,
          ...normalized,
          ...getActiveSnapshot(normalized.activeKey, normalized.buckets),
        };
      },
      onRehydrateStorage: () => (state, error) => {
        const errorMessage =
          error instanceof Error ? error.message : error ? String(error) : null;
        if (state) state.setHydrated(true, errorMessage);
        else
          useCourse.setState({ hydrated: true, rehydrateError: errorMessage });
        if (!error && state) syncWidget(state.courses);
      },
    }
  )
);

export default useCourse;
