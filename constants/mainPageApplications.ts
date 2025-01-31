import { Href } from 'expo-router';

import { MainPageGridDataType } from '@/types/mainPageGridTypes';

export const mainPageApplications: MainPageGridDataType[] = [
  {
    title: '电费查询',
    name: 'electricityBillinQuiry',
    href: '/electricityBillinQuiry',
    imageUrl: require('../assets/images/icons/andorid/electricity.png'),
    key: 'grid-3',
  },
  {
    title: '成绩查询',
    name: 'scoreInquiry',
    imageUrl: require('../assets/images/icons/andorid/grades.png'),
    key: 'grid-4',
    href: '/scoreInquiry',
  },
  {
    title: '地图',
    name: 'map',
    imageUrl: require('../assets/images/icons/andorid/map.png'),
    key: 'grid-5',
    href: '/map' as Href,
  },
];
