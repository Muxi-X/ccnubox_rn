import { FC, memo, useMemo } from 'react';

import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import CourseTable from './components/courseTable';
import { courseType } from './components/courseTable/type';

const CourseTablePage: FC = () => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const data: courseType[] = useMemo(() => {
    return [
      {
        courseName: '数字逻辑',
        time: '08:00',
        date: '一',
        teacher: '张三',
        classroom: 'n217',
      },
      {
        courseName: '数据结构',
        time: '14:00',
        date: '一',
        teacher: '李四',
        classroom: 'n213',
      },
      {
        courseName: '数据结构实验',
        time: '16:10',
        date: '一',
        teacher: '李四',
        classroom: 'n526',
      },
      {
        courseName: '大学英语（JR3）',
        time: '08:00',
        date: '二',
        teacher: '李四',
        classroom: 'n309',
      },
      {
        courseName: '大学体育3',
        time: '10:10',
        date: '二',
        teacher: '李四',
        classroom: '乒乓球馆2',
      },
      {
        courseName: '概率统计',
        time: '14:00',
        date: '二',
        teacher: '李四',
        classroom: 'n215',
      },
      {
        courseName: '民间美术与手工制作',
        time: '16:10',
        date: '二',
        teacher: '李四',
        classroom: 'n218',
      },
      {
        courseName: '面向对象程序设计',
        time: '08:00',
        date: '三',
        teacher: '李四',
        classroom: 'n217',
      },
      {
        courseName: '马克思主义基本原理',
        time: '10:10',
        date: '三',
        teacher: '李四',
        classroom: 'n217',
      },
      {
        courseName: '大学英语视听说',
        time: '14:00',
        date: '三',
        teacher: '李四',
        classroom: 'n217',
      },
      {
        courseName: '数据结构',
        time: '16:10',
        date: '三',
        teacher: '李四',
        classroom: 'n217',
      },
      {
        courseName: '土地管理概论（通核）',
        time: '18:30',
        date: '三',
        teacher: '李四',
        classroom: 'n217',
      },
      {
        courseName: '数字逻辑',
        time: '10:10',
        date: '四',
        teacher: '李四',
        classroom: 'n217',
      },
      {
        courseName: '马克思主义基本原理',
        time: '16:10',
        date: '四',
        teacher: '李四',
        classroom: 'n217',
      },
      {
        courseName: '概率统计',
        time: '08:00',
        date: '五',
        teacher: '李四',
        classroom: 'n217',
      },
      {
        courseName: '面向对象程序设计',
        time: '10:10',
        date: '五',
        teacher: '李四',
        classroom: 'n217',
      },
      {
        courseName: '形势与政策（3）',
        time: '14:00',
        date: '五',
        teacher: '李四',
        classroom: 'n218',
      },
    ] as unknown as courseType[];
  }, []);
  return (
    <View
      style={[{ height: '95%', width: '100%' }, currentStyle?.background_style]}
    >
      <CourseTable data={data}></CourseTable>
    </View>
  );
};

export default memo(CourseTablePage);
