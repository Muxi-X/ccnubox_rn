import { SinglePageType } from '@/types/tabBarTypes';

export const courseTableApplications: Omit<
  Omit<SinglePageType, 'iconName'>,
  'headerLeft'
>[] = [
  {
    title: '添加课程',
    name: 'addCourse',
  },
  {
    title: '添加测试',
    name: 'addTest',
  },
  {
    title: '编辑课程',
    name: 'editCourse',
  },
];
