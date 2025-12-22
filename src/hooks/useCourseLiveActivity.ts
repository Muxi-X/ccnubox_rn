import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { courseType } from '@/modules/courseTable/components/courseTable/type';
import {
  calculateMinutesUntilClass,
  courseLiveActivity,
  formatClassTime,
  getClassStartTime,
} from '@/utils/courseLiveActivity';

/**
 * 自动管理课程 Live Activity 的 Hook
 * 在上课前 10 分钟自动启动动态岛提醒
 */
export function useCourseLiveActivity(courses: courseType[]) {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // 监听 App 状态变化
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // 启动定时检查
    startPeriodicCheck();

    return () => {
      subscription.remove();
      stopPeriodicCheck();
      courseLiveActivity.endActivity();
    };
  }, [courses]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App 回到前台，重新检查
      checkUpcomingCourse();
    }
    appState.current = nextAppState;
  };

  const startPeriodicCheck = () => {
    stopPeriodicCheck();
    // 每分钟检查一次
    checkIntervalRef.current = setInterval(
      checkUpcomingCourse,
      60000
    ) as unknown as NodeJS.Timeout;
    // 立即检查一次
    checkUpcomingCourse();
  };

  const stopPeriodicCheck = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  };

  const checkUpcomingCourse = () => {
    if (!courses || courses.length === 0) return;

    // 获取今天是星期几
    const now = new Date();
    const weekday = now.getDay();
    const adjustedWeekday = weekday === 0 ? 7 : weekday;

    // 获取今天的课程
    const todayCourses = courses
      .filter(course => course.day === adjustedWeekday)
      .sort((a, b) => {
        const aStart = parseInt(a.class_when.split('-')[0]);
        const bStart = parseInt(b.class_when.split('-')[0]);
        return aStart - bStart;
      });

    if (todayCourses.length === 0) return;

    // 找到下一节课
    const nextCourse = todayCourses.find(course => {
      const minutesUntil = calculateMinutesUntilClass(course.class_when);
      return minutesUntil > 0 && minutesUntil <= 100; // 100分钟内的课程
    });

    if (!nextCourse) {
      // 没有即将开始的课程，结束现有的 Live Activity
      if (courseLiveActivity.hasActiveActivity()) {
        courseLiveActivity.endActivity();
      }
      return;
    }

    const minutesUntil = calculateMinutesUntilClass(nextCourse.class_when);

    // 在上课前 10 分钟启动 Live Activity
    if (minutesUntil <= 10 && minutesUntil > 0) {
      if (!courseLiveActivity.hasActiveActivity()) {
        const { start, end } = formatClassTime(nextCourse.class_when);
        const classStartTime = getClassStartTime(nextCourse.class_when);

        courseLiveActivity.startCourseReminder(
          {
            courseName: nextCourse.classname,
            location: nextCourse.where,
            startTime: start,
            endTime: end,
          },
          classStartTime
        );
      }
    }
  };
}
