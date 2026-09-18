import { ExtensionStorage } from '@bacons/apple-targets';
import { Platform } from 'react-native';

import type { courseType } from '@/modules/courseTable/components/courseTable/type';
import useTimeStore from '@/store/time';
import {
  buildAndroidWidgetCourseData,
  serializeCoursesForAppleWidget,
} from '@/utils/courseRuntime';
import { logger } from '@/utils/logger';

import CcnuboxWidget from '../../modules/ccnubox-widget';

export const updateCourseData = async (courses: courseType[]) => {
  const currentWeek = useTimeStore.getState().getCurrentWeek();

  if (!courses) {
    logger.debug('没有课程数据');
    return;
  }

  const courseData = buildAndroidWidgetCourseData(courses, currentWeek);

  logger.debug('准备更新小组件课程数据', { courseData });

  if (!CcnuboxWidget) {
    throw new Error('CcnuboxWidget native module is unavailable');
  }

  await CcnuboxWidget.updateCourseData(JSON.stringify(courseData))
    .then((result: string) => {
      logger.info('小组件数据更新成功', { result });
    })
    .catch((error: unknown) => {
      logger.error('小组件数据更新失败', error);
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
