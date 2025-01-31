import { Href } from 'expo-router';

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
  {
    title: '电费查询',
    name: 'electricityBillinQuiry',
    href: '/electricityBillinQuiry',
    imageUrl: require('../assets/images/mx-logo.png'),
    key: 'grid-3',
  },
  {
    title: '成绩查询',
    name: 'scoreInquiry',
    imageUrl: require('../assets/images/mx-logo.png'),
    key: 'grid-4',
    href: '/scoreInquiry',
  },
  {
    title: '地图',
    name: 'map',
    imageUrl: require('../assets/images/mx-logo.png'),
    key: 'grid-5',
    href: '/map' as Href,
  },
];
