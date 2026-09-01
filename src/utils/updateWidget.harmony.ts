import { TurboModule, TurboModuleRegistry } from 'react-native';

import type { courseType } from '@/modules/courseTable/components/courseTable/type';
import useCourseStore from '@/store/course';
import useTimeStore from '@/store/time';
import { getClassTimeRange } from '@/utils/courseRuntime';

interface ExpoHarmonySystemModule extends TurboModule {
  updateCourseWidget(_payload: string): Promise<void>;
}

const nativeModule =
  TurboModuleRegistry.getEnforcing<ExpoHarmonySystemModule>(
    'ExpoHarmonySystem'
  );

export const updateCourseData = async (nextCourses?: courseType[]) => {
  const courses = nextCourses ?? useCourseStore.getState().courses;
  const schoolTime = useTimeStore.getState().schoolTime;
  const payload = {
    schoolTime,
    courses: courses.map(course => ({
      day: course.day,
      location: course.where,
      name: course.classname,
      start: getClassTimeRange(course.class_when).start,
      weeks: course.weeks,
    })),
  };

  await nativeModule.updateCourseWidget(JSON.stringify(payload));
};

export const updateCourseWidgetData = updateCourseData;
