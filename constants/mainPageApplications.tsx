import { SinglePageType } from '@/types/tabBarTypes';

export const mainPageApplications: Omit<
  Omit<SinglePageType, 'iconName'>,
  'headerLeft'
>[] = [
  {
    name: 'index',
    title: '蹭课',
    headerRight: () => <></>,
  },
];
