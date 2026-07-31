const SECONDS_PER_WEEK = 7 * 24 * 60 * 60;

export const DEFAULT_SEMESTER_WEEK_COUNT = 20;

export const calculateWeekFromStart = (
  schoolTime?: number,
  now = Date.now()
) => {
  if (!schoolTime) return 1;

  const diffDays = Math.floor(
    (now - schoolTime * 1000) / (24 * 60 * 60 * 1000)
  );
  return Math.floor(diffDays / 7) + 1;
};

export const calculateSemesterWeekCount = (
  schoolTime?: number,
  holidayTime?: number
) => {
  if (!schoolTime || !holidayTime || holidayTime <= schoolTime) {
    return DEFAULT_SEMESTER_WEEK_COUNT;
  }

  return Math.max(1, Math.ceil((holidayTime - schoolTime) / SECONDS_PER_WEEK));
};

export const clampWeekToSemester = (week: number, totalWeeks: number) => {
  return Math.min(Math.max(week, 1), totalWeeks);
};
