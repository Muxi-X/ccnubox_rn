import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

import Button from '@/components/button';

import useWeekStore from '@/store/weekStore';
export default function All() {
  const { WidgetManager } = NativeModules;
  const { currentWeek } = useWeekStore();
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
  const updateCourseData = async () => {
    const courses = await getCachedCourseTable();
    if (!courses) {
      console.error('No cached course data found');
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
        console.log('数据更新成功:', result);
        // Force widget to refresh
        WidgetManager.refreshWidget?.();
      })
      .catch((error: unknown) => {
        console.error('数据更新失败:', error);
      });
  };

  return <Button onPress={updateCourseData}>测试小组件</Button>;
}
