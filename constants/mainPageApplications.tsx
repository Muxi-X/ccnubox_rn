import { MainPageGridDataType } from '@/types/mainPageGridTypes';

export const mainPageApplications: MainPageGridDataType[] = [
  {
    title: '我是',
    name: 'test1',
    href: '/test1',
    imageUrl: require('../assets/images/mx-logo.png'),
    key: 'grid-1',
  },
  {
    title: '谁',
    name: 'test2',
    href: '/auth/login',
    imageUrl: require('../assets/images/mx-logo.png'),
    key: 'grid-2',
  },
];
