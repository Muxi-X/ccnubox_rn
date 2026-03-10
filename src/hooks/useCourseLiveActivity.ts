import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import useTimeStore from '@/store/time';

import type { courseType } from '@/modules/courseTable/components/courseTable/type';
import {
  courseLiveActivity,
  LIVE_ACTIVITY_ENABLED,
} from '@/utils/courseLiveActivity';
import {
  buildCoursesByDay,
  calculateMinutesUntilClass,
  getClassStartTime,
  getClassTimeRange,
} from '@/utils/courseRuntime';

/**
 * 自动管理课程 Live Activity 的 Hook
 * 在上课前 10 分钟自动启动动态岛提醒
 */
export function useCourseLiveActivity(courses: courseType[]) {
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);
  const coursesByDay = useMemo(
    () => buildCoursesByDay(courses ?? []),
    [courses]
  );
  const hasCourses = useMemo(
    () => Object.keys(coursesByDay).length > 0,
    [coursesByDay]
  );

  const checkUpcomingCourse = useCallback(async () => {
    if (!LIVE_ACTIVITY_ENABLED) return;

    if (courseLiveActivity.isManualModeActive()) {
      return;
    }

    if (!hasCourses) {
      if (await courseLiveActivity.hasValidActiveActivity()) {
        await courseLiveActivity.endActivity();
      }
      return;
    }

    const now = new Date();
    const weekday = now.getDay();
    const adjustedWeekday = weekday === 0 ? 7 : weekday;
    const currentWeek = useTimeStore.getState().getCurrentWeek();
    const todayCourses = coursesByDay[adjustedWeekday] ?? [];

    if (todayCourses.length === 0) {
      return;
    }

    const nextCourse = todayCourses.find(({ course }) => {
      if (!course.weeks?.includes(currentWeek)) {
        return false;
      }

      const minutesUntil = calculateMinutesUntilClass(course.class_when, now);
      return minutesUntil > 0 && minutesUntil <= 10;
    });

    if (!nextCourse) {
      if (await courseLiveActivity.hasValidActiveActivity()) {
        await courseLiveActivity.endActivity();
      }
      return;
    }

    if (!(await courseLiveActivity.hasValidActiveActivity())) {
      const { start, end } = getClassTimeRange(nextCourse.course.class_when);
      const classStartTime = getClassStartTime(
        nextCourse.course.class_when,
        now
      );

      await courseLiveActivity.startCourseReminder(
        {
          courseName: nextCourse.course.classname,
          location: nextCourse.course.where,
          startTime: start,
          endTime: end,
        },
        classStartTime
      );
    }
  }, [coursesByDay, hasCourses]);

  const stopPeriodicCheck = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  const startPeriodicCheck = useCallback(() => {
    stopPeriodicCheck();
    checkIntervalRef.current = setInterval(() => {
      void checkUpcomingCourse();
    }, 60000);
    void checkUpcomingCourse();
  }, [checkUpcomingCourse, stopPeriodicCheck]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        void checkUpcomingCourse();
        setTimeout(() => {
          void checkUpcomingCourse();
        }, 1200);
      }
      appState.current = nextAppState;
    },
    [checkUpcomingCourse]
  );

  useEffect(() => {
    if (!LIVE_ACTIVITY_ENABLED) {
      void courseLiveActivity.endAllActivities();
      return;
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    startPeriodicCheck();

    return () => {
      subscription.remove();
      stopPeriodicCheck();
      void courseLiveActivity.endActivity();
    };
  }, [handleAppStateChange, startPeriodicCheck, stopPeriodicCheck]);
}
