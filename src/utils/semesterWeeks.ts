export const DEFAULT_SEMESTER_WEEK_COUNT = 20;

/**
 * 获取某个日期所在自然周的周一 00:00:00 的 Date 对象
 */
export const getWeekMonday = (timestampOrDate: number | Date): Date => {
  const date = new Date(
    typeof timestampOrDate === 'number' && timestampOrDate < 1e11
      ? timestampOrDate * 1000
      : timestampOrDate
  );
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 是周日, 1 是周一, ..., 6 是周六
  const diffToMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diffToMonday);
  return date;
};

export const calculateWeekFromStart = (
  schoolTime?: number,
  now = Date.now()
) => {
  if (!schoolTime) return 1;

  const firstMonday = getWeekMonday(schoolTime);
  const nowDate = new Date(now);
  nowDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (nowDate.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000)
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

  const firstMonday = getWeekMonday(schoolTime);
  const holidayDate = new Date(
    holidayTime < 1e11 ? holidayTime * 1000 : holidayTime
  );
  holidayDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (holidayDate.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.max(1, Math.ceil(diffDays / 7));
};

export const clampWeekToSemester = (week: number, totalWeeks: number) => {
  return Math.min(Math.max(week, 1), totalWeeks);
};
