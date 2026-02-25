import { NativeModules, Platform } from 'react-native';

const { CourseLiveActivityModule } = NativeModules;

export interface CourseInfo {
  courseName: string;
  location: string;
  startTime: string;
  endTime: string;
}

class CourseLiveActivityManager {
  private activeActivityId: string | null = null;
  private endTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 启动课程提醒 Live Activity
   * @param courseInfo 课程信息
   * @param classStartTime 上课开始时间 (Date 对象)
   */
  async startCourseReminder(
    courseInfo: CourseInfo,
    classStartTime: Date
  ): Promise<string | null> {
    if (Platform.OS !== 'ios') {
      console.log('Live Activity only available on iOS');
      return null;
    }

    try {
      // 传递时间戳给 Native
      const activityId = await CourseLiveActivityModule.startActivity(
        courseInfo.courseName,
        courseInfo.location,
        courseInfo.startTime,
        courseInfo.endTime,
        classStartTime.getTime() // 毫秒时间戳
      );

      this.activeActivityId = activityId;
      console.log('✅ Live Activity started:', activityId);

      // 设置定时器，到时间自动关闭
      this.scheduleAutoEnd(classStartTime);

      return activityId;
    } catch (error) {
      console.error('❌ Failed to start Live Activity:', error);
      return null;
    }
  }

  /**
   * 设置自动关闭定时器
   */
  private scheduleAutoEnd(classStartTime: Date) {
    this.clearEndTimer();

    const now = Date.now();
    const endTime = classStartTime.getTime();
    const delay = endTime - now;

    if (delay > 0) {
      this.endTimer = setTimeout(() => {
        console.log('⏰ Auto ending Live Activity');
        this.endActivity();
      }, delay);
    }
  }

  /**
   * 清除定时器
   */
  private clearEndTimer() {
    if (this.endTimer) {
      clearTimeout(this.endTimer);
      this.endTimer = null;
    }
  }

  /**
   * 更新 Live Activity 状态
   */
  async updateActivity(classStartTime: Date, isInClass: boolean) {
    if (!this.activeActivityId) return;

    try {
      await CourseLiveActivityModule.updateActivity(
        this.activeActivityId,
        classStartTime.getTime(),
        isInClass
      );
      console.log('✅ Live Activity updated');
    } catch (error) {
      console.error('❌ Failed to update Live Activity:', error);
    }
  }

  /**
   * 结束 Live Activity
   */
  async endActivity() {
    this.clearEndTimer();

    if (!this.activeActivityId) return;

    try {
      await CourseLiveActivityModule.endActivity(this.activeActivityId);
      console.log('✅ Live Activity ended');
      this.activeActivityId = null;
    } catch (error) {
      console.error('❌ Failed to end Live Activity:', error);
    }
  }

  /**
   * 结束所有 Live Activity
   */
  async endAllActivities() {
    this.clearEndTimer();

    try {
      await CourseLiveActivityModule.endAllActivities();
      console.log('✅ All Live Activities ended');
      this.activeActivityId = null;
    } catch (error) {
      console.error('❌ Failed to end all Live Activities:', error);
    }
  }

  /**
   * 检查是否有活动的 Live Activity
   */
  hasActiveActivity(): boolean {
    return this.activeActivityId !== null;
  }
}

export const courseLiveActivity = new CourseLiveActivityManager();

/**
 * 根据节次计算上课时间
 * @param classWhen 节次字符串，如 "1-2"
 * @returns 今天该节次的开始时间
 */
export function getClassStartTime(classWhen: string): Date {
  const startSection = parseInt(classWhen.split('-')[0], 10);

  // 节次对应的开始时间 [小时, 分钟]
  const sectionTimes: { [key: number]: [number, number] } = {
    1: [8, 0],
    2: [8, 50],
    3: [10, 10],
    4: [11, 0],
    5: [14, 0],
    6: [14, 50],
    7: [16, 10],
    8: [17, 0],
    9: [19, 0],
    10: [19, 50],
  };

  const [hour, minute] = sectionTimes[startSection] || [8, 0];

  const now = new Date();
  const classTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0
  );

  return classTime;
}

/**
 * 格式化时间（如 "08:00"）
 */
export function formatClassTime(classWhen: string): {
  start: string;
  end: string;
} {
  const [startSection, endSection] = classWhen.split('-').map(Number);

  const sectionTimes: { [key: number]: string } = {
    1: '08:00',
    2: '09:40',
    3: '10:10',
    4: '11:50',
    5: '14:00',
    6: '15:40',
    7: '16:10',
    8: '17:50',
    9: '19:00',
    10: '20:40',
    11: '20:50',
    12: '22:30',
  };

  return {
    start: sectionTimes[startSection] || '00:00',
    end: sectionTimes[endSection + 1] || '00:00',
  };
}

/**
 * 计算距离上课还有多少分钟
 * @param classWhen 节次字符串，如 "1-2"
 * @returns 距离上课的分钟数，如果已经过了上课时间则返回负数或0
 */
export function calculateMinutesUntilClass(classWhen: string): number {
  const classStartTime = getClassStartTime(classWhen);
  const now = new Date();
  const diffMs = classStartTime.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return diffMinutes;
}
