export const LIVE_ACTIVITY_ENABLED = false;

export const courseLiveActivity = {
  disableManualMode: () => {},
  enableManualMode: (_duration: number) => {},
  endActivity: async () => {},
  endAllActivities: async () => {},
  hasValidActiveActivity: async () => false,
  isManualModeActive: () => false,
  startCourseReminder: async () => null as string | null,
};
