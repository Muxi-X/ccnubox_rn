import { NativeModules } from 'react-native';

import Button from '@/components/button';
export default function All() {
  const { WidgetManager } = NativeModules;
  const updateCourseData = () => {
    const courseData = {
      date: new Date()
        .toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        .replace(/\s/g, ''),
      courses: [
        {
          classWhen: '8:00-9:35',
          classname: '高等数学',
          credit: 4,
          day: 1,
          id: '666',
          semester: '2024-2025第一学期',
          teacher: 'sjn',
        },
      ],
    };

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

  return <Button onPress={updateCourseData}>222</Button>;
}
