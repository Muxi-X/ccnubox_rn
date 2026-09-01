import common from '@ohos.app.ability.common';
import preferences from '@ohos.data.preferences';
import { formBindingData, formProvider } from '@kit.FormKit';

const PREFERENCES_NAME: string = 'course_widget';
const PAYLOAD_KEY: string = 'payload';
const FORM_IDS_KEY: string = 'form_ids';
const WIDE_FORM_IDS_KEY: string = 'wide_form_ids';

interface CourseWidgetCourse {
  day: number;
  location: string;
  name: string;
  start: string;
  weeks: number[];
}

interface CourseWidgetPayload {
  courses: CourseWidgetCourse[];
  schoolTime: number;
}

interface CourseWidgetBinding {
  course1: string;
  course2: string;
  course3: string;
  course4: string;
  course5: string;
  course6: string;
  emptyMessage: string;
  isWide: boolean;
  title: string;
}

const EMPTY_PAYLOAD: string = JSON.stringify({
  courses: [],
  schoolTime: 0,
});

export function createCourseWidgetBindingData(
  payload: string,
  isWide: boolean = false
): formBindingData.FormBindingData {
  const parsed: CourseWidgetPayload = JSON.parse(payload);
  const now = new Date();
  const day = now.getDay() === 0 ? 7 : now.getDay();
  const currentWeek = calculateCurrentWeek(parsed.schoolTime, now);
  const todayCourses: CourseWidgetCourse[] = [];

  for (const course of parsed.courses) {
    if (course.day === day && course.weeks.includes(currentWeek)) {
      todayCourses.push(course);
    }
  }
  todayCourses.sort((left, right) => left.start.localeCompare(right.start));

  const data: CourseWidgetBinding = {
    title: `第${currentWeek}週 · 星期${weekdayName(day)}`,
    emptyMessage: todayCourses.length === 0 ? '今天沒有課程' : '',
    course1: formatCourse(todayCourses[0]),
    course2: formatCourse(todayCourses[1]),
    course3: formatCourse(todayCourses[2]),
    course4: formatCourse(todayCourses[3]),
    course5: formatCourse(todayCourses[4]),
    course6: formatCourse(todayCourses[5]),
    isWide,
  };
  return formBindingData.createFormBindingData(data);
}

export function createEmptyCourseWidgetBindingData(
  isWide: boolean = false
): formBindingData.FormBindingData {
  return createCourseWidgetBindingData(EMPTY_PAYLOAD, isWide);
}

export async function registerCourseWidget(
  context: common.Context,
  formId: string,
  isWide: boolean
): Promise<void> {
  const store = await preferences.getPreferences(context, PREFERENCES_NAME);
  const formIds = readFormIds(await store.get(FORM_IDS_KEY, '[]') as string);
  if (!formIds.includes(formId)) {
    formIds.push(formId);
    await store.put(FORM_IDS_KEY, JSON.stringify(formIds));
  }
  const wideFormIds = readFormIds(
    await store.get(WIDE_FORM_IDS_KEY, '[]') as string
  ).filter((id) => id !== formId);
  if (isWide) {
    wideFormIds.push(formId);
  }
  await store.put(WIDE_FORM_IDS_KEY, JSON.stringify(wideFormIds));
  await store.flush();
  await refreshCourseWidget(context, formId);
}

export async function removeCourseWidget(context: common.Context, formId: string): Promise<void> {
  const store = await preferences.getPreferences(context, PREFERENCES_NAME);
  const formIds = readFormIds(await store.get(FORM_IDS_KEY, '[]') as string)
    .filter((id) => id !== formId);
  const wideFormIds = readFormIds(
    await store.get(WIDE_FORM_IDS_KEY, '[]') as string
  ).filter((id) => id !== formId);
  await store.put(FORM_IDS_KEY, JSON.stringify(formIds));
  await store.put(WIDE_FORM_IDS_KEY, JSON.stringify(wideFormIds));
  await store.flush();
}

export async function saveAndRefreshCourseWidgets(context: common.Context, payload: string): Promise<void> {
  const store = await preferences.getPreferences(context, PREFERENCES_NAME);
  await store.put(PAYLOAD_KEY, payload);
  await store.flush();

  const formIds = readFormIds(await store.get(FORM_IDS_KEY, '[]') as string);
  const wideFormIds = readFormIds(
    await store.get(WIDE_FORM_IDS_KEY, '[]') as string
  );
  for (const formId of formIds) {
    await formProvider.updateForm(
      formId,
      createCourseWidgetBindingData(payload, wideFormIds.includes(formId))
    );
  }
}

export async function refreshCourseWidget(context: common.Context, formId: string): Promise<void> {
  const store = await preferences.getPreferences(context, PREFERENCES_NAME);
  const payload = await store.get(PAYLOAD_KEY, EMPTY_PAYLOAD) as string;
  const wideFormIds = readFormIds(
    await store.get(WIDE_FORM_IDS_KEY, '[]') as string
  );
  await formProvider.updateForm(
    formId,
    createCourseWidgetBindingData(payload, wideFormIds.includes(formId))
  );
}

function calculateCurrentWeek(schoolTime: number, now: Date): number {
  if (!schoolTime) {
    return 1;
  }

  const firstMonday = new Date(schoolTime < 100000000000 ? schoolTime * 1000 : schoolTime);
  firstMonday.setHours(0, 0, 0, 0);
  const firstDay = firstMonday.getDay();
  firstMonday.setDate(firstMonday.getDate() - (firstDay === 0 ? 6 : firstDay - 1));

  const today = new Date(now.getTime());
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - firstMonday.getTime()) / 604800000) + 1;
}

function formatCourse(course: CourseWidgetCourse | undefined): string {
  if (!course) {
    return '';
  }
  return course.location.length > 0
    ? `${course.start}  ${course.name} · ${course.location}`
    : `${course.start}  ${course.name}`;
}

function readFormIds(value: string): string[] {
  return JSON.parse(value) as string[];
}

function weekdayName(day: number): string {
  const names: string[] = ['一', '二', '三', '四', '五', '六', '日'];
  return names[day - 1] ?? '';
}
