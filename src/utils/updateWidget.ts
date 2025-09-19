import { NativeModules } from 'react-native';

import useCourseStore from '@/store/course';
import useTimeStore from '@/store/time';

export const updateCourseData = async () => {
  const { WidgetManager } = NativeModules;

  const currentWeek = useTimeStore.getState().getCurrentWeek();

  const courses = useCourseStore.getState().courses;

  if (!courses) {
    console.log('没有课程数据');
    return;
  }

  const courseData = {
    date: `第${currentWeek}周`,

    courses: courses.map(course => ({
      id: course.id,
    })),
  };

  console.log(courseData);

  WidgetManager.updateCourseData(JSON.stringify(courseData))
    .then((result: string) => {
      console.log('数据更新成功:', result); // Force widget to refresh
      // console.log("Course Data:", JSON.stringify(courseData));
      WidgetManager.refreshWidget?.();
    })
    .catch((error: unknown) => {
      console.error('数据更新失败:', error);
    });
};
