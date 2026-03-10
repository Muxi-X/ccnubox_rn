import { NativeModules, Platform } from 'react-native';

export {
  calculateMinutesUntilClass,
  getClassTimeRange as formatClassTime,
  getClassStartTime,
} from '@/utils/courseRuntime';

type CourseLiveActivityModuleType = {
  startActivity: (
    courseName: string,
    location: string,
    startTime: string,
    endTime: string,
    classStartTimestamp: number
  ) => Promise<string>;
  updateActivity: (
    activityId: string,
    classStartTimestamp: number,
    isInClass: boolean
  ) => Promise<string>;
  hasActivity: (activityId: string) => Promise<boolean>;
  endActivity: (activityId: string) => Promise<string>;
  endAllActivities: () => Promise<string>;
};

const getCourseLiveActivityModule = (): CourseLiveActivityModuleType | null => {
  return (
    (
      NativeModules as {
        CourseLiveActivityModule?: CourseLiveActivityModuleType;
      }
    ).CourseLiveActivityModule ?? null
  );
};

// 发布开关：本期暂不上线 Live Activity，保留代码以便后续恢复
export const LIVE_ACTIVITY_ENABLED = false;

export interface CourseInfo {
  courseName: string;
  location: string;
  startTime: string;
  endTime: string;
}

class CourseLiveActivityManager {
  private activeActivityId: string | null = null;
  private endTimer: ReturnType<typeof setTimeout> | null = null;
  private manualModeUntil: number | null = null;
  private hasWarnedMissingModule = false;

  private getModule() {
    const module = getCourseLiveActivityModule();
    if (!module && !this.hasWarnedMissingModule) {
      this.hasWarnedMissingModule = true;
      console.warn(
        '[LiveActivity] CourseLiveActivityModule 不存在，跳过相关调用'
      );
    }
    return module;
  }

  /**
   * 启动课程提醒 Live Activity
   * @param courseInfo 课程信息
   * @param classStartTime 上课开始时间 (Date 对象)
   */
  async startCourseReminder(
    courseInfo: CourseInfo,
    classStartTime: Date
  ): Promise<string | null> {
    if (!LIVE_ACTIVITY_ENABLED) {
      return null;
    }

    if (Platform.OS !== 'ios') {
      console.log('Live Activity only available on iOS');
      return null;
    }

    const liveActivityModule = this.getModule();
    if (!liveActivityModule) {
      return null;
    }

    try {
      // 传递时间戳给 Native
      const activityId = await liveActivityModule.startActivity(
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
        this.disableManualMode();
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
    if (!LIVE_ACTIVITY_ENABLED) return;
    if (!this.activeActivityId) return;

    const liveActivityModule = this.getModule();
    if (!liveActivityModule) return;

    try {
      await liveActivityModule.updateActivity(
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
   * 与 Native 同步当前活动状态，防止内存里的 activityId 过期后“假活跃”
   */
  async hasValidActiveActivity(): Promise<boolean> {
    if (!LIVE_ACTIVITY_ENABLED) return false;
    if (!this.activeActivityId) return false;

    const liveActivityModule = this.getModule();
    if (!liveActivityModule) {
      this.activeActivityId = null;
      return false;
    }

    try {
      const exists = await liveActivityModule.hasActivity(
        this.activeActivityId
      );
      if (!exists) {
        this.activeActivityId = null;
      }
      return Boolean(exists);
    } catch (error) {
      console.warn('⚠️ Failed to validate Live Activity state:', error);
      return this.activeActivityId !== null;
    }
  }

  /**
   * 结束 Live Activity
   */
  async endActivity() {
    this.clearEndTimer();
    this.disableManualMode();

    if (!this.activeActivityId) return;

    const liveActivityModule = this.getModule();
    if (!liveActivityModule) {
      this.activeActivityId = null;
      return;
    }

    try {
      await liveActivityModule.endActivity(this.activeActivityId);
      console.log('✅ Live Activity ended');
      this.activeActivityId = null;
    } catch (error) {
      console.error('❌ Failed to end Live Activity:', error);
      // Native 侧找不到该活动时，避免 JS 保留脏 id 导致后续无法重新拉起
      this.activeActivityId = null;
    }
  }

  /**
   * 结束所有 Live Activity
   */
  async endAllActivities() {
    this.clearEndTimer();
    this.disableManualMode();

    const liveActivityModule = this.getModule();
    if (!liveActivityModule) {
      this.activeActivityId = null;
      return;
    }

    try {
      await liveActivityModule.endAllActivities();
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

  /**
   * 启用独立测试模式（期间自动课表检查不会干预 Live Activity）
   */
  enableManualMode(durationMs: number = 20 * 60 * 1000) {
    this.manualModeUntil = Date.now() + durationMs;
  }

  /**
   * 关闭独立测试模式
   */
  disableManualMode() {
    this.manualModeUntil = null;
  }

  /**
   * 是否处于独立测试模式
   */
  isManualModeActive(): boolean {
    if (!this.manualModeUntil) return false;
    if (Date.now() > this.manualModeUntil) {
      this.manualModeUntil = null;
      return false;
    }
    return true;
  }
}

export const courseLiveActivity = new CourseLiveActivityManager();
