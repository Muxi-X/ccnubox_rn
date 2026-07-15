import { ExtensionStorage } from '@bacons/apple-targets';
import { Platform } from 'react-native';

import useCourseStore from '@/store/course';
import useTimeStore from '@/store/time';

import type { courseType } from '@/modules/courseTable/components/courseTable/type';
import {
  buildAndroidWidgetCourseData,
  serializeCoursesForAppleWidget,
} from '@/utils/courseRuntime';

import CcnuboxWidget from '../../modules/ccnubox-widget';

export const updateCourseData = async (nextCourses?: courseType[]) => {
  const currentWeek = useTimeStore.getState().getCurrentWeek();

  const courses = nextCourses ?? useCourseStore.getState().courses;

  if (!courses) {
    console.log('没有课程数据');
    return;
  }

  const courseData = buildAndroidWidgetCourseData(courses, currentWeek);

  console.log(courseData);

  if (!CcnuboxWidget) {
    throw new Error('CcnuboxWidget native module is unavailable');
  }

  await CcnuboxWidget.updateCourseData(JSON.stringify(courseData))
    .then((result: string) => {
      console.log('数据更新成功:', result);
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
