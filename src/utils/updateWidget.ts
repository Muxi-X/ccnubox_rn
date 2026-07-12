import { ExtensionStorage } from '@bacons/apple-targets';
import { NativeModules, Platform } from 'react-native';

import useCourseStore from '@/store/course';
import useTimeStore from '@/store/time';

import type { courseType } from '@/modules/courseTable/components/courseTable/type';
import {
  buildAndroidWidgetCourseData,
  serializeCoursesForAppleWidget,
} from '@/utils/courseRuntime';

export const updateCourseData = async (nextCourses?: courseType[]) => {
  const { WidgetManager } = NativeModules;

  const currentWeek = useTimeStore.getState().getCurrentWeek();

  const courses = nextCourses ?? useCourseStore.getState().courses;

  if (!courses) {
    console.log('没有课程数据');
    return;
  }

  const courseData = buildAndroidWidgetCourseData(courses, currentWeek);

  console.log(courseData);

  await WidgetManager.updateCourseData(JSON.stringify(courseData))
    .then((result: string) => {
      console.log('数据更新成功:', result); // Force widget to refresh
      // console.log("Course Data:", JSON.stringify(courseData));
      WidgetManager.refreshWidget?.();
    })
    .catch((error: unknown) => {
      console.error('数据更新失败:', error);
    });
};

export const updateCourseWidgetData = async (courses: courseType[]) => {
  if (Platform.OS === 'android') {
    await updateCourseData(courses);
    return;
  }

  if (Platform.OS === 'ios') {
    const extensionStorage = new ExtensionStorage('group.release-20240916');
    extensionStorage.set(
      'courseTable',
      serializeCoursesForAppleWidget(courses)
    );
    ExtensionStorage.reloadWidget();
  }
};
