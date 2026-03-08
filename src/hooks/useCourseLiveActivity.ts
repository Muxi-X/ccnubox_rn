import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { courseType } from '@/modules/courseTable/components/courseTable/type';
import {
  calculateMinutesUntilClass,
  courseLiveActivity,
  formatClassTime,
  getClassStartTime,
  LIVE_ACTIVITY_ENABLED,
} from '@/utils/courseLiveActivity';
import useTimeStore from '@/store/time';

/**
 * 自动管理课程 Live Activity 的 Hook
 * 在上课前 10 分钟自动启动动态岛提醒
 */
export function useCourseLiveActivity(courses: courseType[]) {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!LIVE_ACTIVITY_ENABLED) {
      // 下线期间确保关闭已存在活动
      void courseLiveActivity.endAllActivities();
      return;
    }

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
      void checkUpcomingCourse();
      // 等待可能的 store hydration / 周次更新后再补一次检查
      setTimeout(() => {
        void checkUpcomingCourse();
      }, 1200);
    }
    appState.current = nextAppState;
  };

  const startPeriodicCheck = () => {
    stopPeriodicCheck();
    // 每分钟检查一次
    checkIntervalRef.current = setInterval(() => {
      void checkUpcomingCourse();
    }, 60000) as unknown as NodeJS.Timeout;
    // 立即检查一次
    void checkUpcomingCourse();
  };

  const stopPeriodicCheck = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  };

  const checkUpcomingCourse = async () => {
    if (!LIVE_ACTIVITY_ENABLED) return;

    // 独立测试模式下，不让自动检查干预手动启动的 Live Activity
    if (courseLiveActivity.isManualModeActive()) {
      return;
    }

    if (!courses || courses.length === 0) {
      if (await courseLiveActivity.hasValidActiveActivity()) {
        await courseLiveActivity.endActivity();
      }
      return;
    }

    // 获取今天是星期几
    const now = new Date();
    const weekday = now.getDay();
    const adjustedWeekday = weekday === 0 ? 7 : weekday;
    const currentWeek = useTimeStore.getState().getCurrentWeek();

    // 只考虑“今天且本周”的课程
    const todayCourses = courses
      .filter(
        course =>
          course.day === adjustedWeekday && course.weeks?.includes(currentWeek)
      )
      .sort((a, b) => {
        const aStart = parseInt(a.class_when.split('-')[0]);
        const bStart = parseInt(b.class_when.split('-')[0]);
        return aStart - bStart;
      });

    if (todayCourses.length === 0) return;

    // 找到上课前 10 分钟内的下一节课
    const nextCourse = todayCourses.find(course => {
      const minutesUntil = calculateMinutesUntilClass(course.class_when);
      return minutesUntil > 0 && minutesUntil <= 10;
    });

    if (!nextCourse) {
      // 没有即将开始的课程，结束现有的 Live Activity
      if (await courseLiveActivity.hasValidActiveActivity()) {
        await courseLiveActivity.endActivity();
      }
      return;
    }

    if (!(await courseLiveActivity.hasValidActiveActivity())) {
      const { start, end } = formatClassTime(nextCourse.class_when);
      const classStartTime = getClassStartTime(nextCourse.class_when);

      await courseLiveActivity.startCourseReminder(
        {
          courseName: nextCourse.classname,
          location: nextCourse.where,
          startTime: start,
          endTime: end,
        },
        classStartTime
      );
    }
  };
}
