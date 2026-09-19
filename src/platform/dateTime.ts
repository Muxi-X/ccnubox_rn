import dayjs from 'dayjs';

import { isHarmony } from './runtime';

export const formatCourseUpdateTime = (date: Date) =>
  isHarmony
    ? dayjs(date).format('YYYY/MM/DD HH:mm:ss')
    : date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

export const formatNotificationTime = (date: Date) =>
  isHarmony
    ? dayjs(date).format('HH:mm')
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatFeedbackDate = (date: Date) => {
  if (isHarmony) {
    // Feedback records use modern Asia/Shanghai dates (UTC+8, without DST).
    return new Date(date.getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
  }
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};
