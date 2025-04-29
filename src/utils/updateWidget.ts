import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

import weekStore from '@/store/weekStore';

import globalEventBus from './eventBus';

export const updateCourseData = async () => {
  const { WidgetManager } = NativeModules;

  const getCachedCourseTable = async () => {
    const dataString = await AsyncStorage.getItem('course_table');

    if (dataString) {
      try {
        const data = JSON.parse(dataString);

        return Array.isArray(data) ? data : null;
      } catch (error) {
        console.error('解析缓存数据失败:', error);
      }
    }

    return null;
  };

  const currentWeek = weekStore.getState().currentWeek;

  const courses = await getCachedCourseTable();

  if (!courses) {
    return;
  }

  const courseData = {
    date: `第${currentWeek}周`,

    courses: courses.map(course => ({
      id: course.id,
    })),
  };

  console.log('111', courseData);

  WidgetManager.updateCourseData(JSON.stringify(courseData))

    .then((result: string) => {
      console.log('数据更新成功:', result); // Force widget to refresh

      WidgetManager.refreshWidget?.();
    })

    .catch((error: unknown) => {
      console.error('数据更新失败:', error);
    });
};

globalEventBus.on('updateCourseData', updateCourseData);
