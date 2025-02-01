import { Href } from 'expo-router';
import { Platform } from 'react-native';

import { MainPageGridDataType } from '@/types/mainPageGridTypes';

export const mainPageApplications: MainPageGridDataType[] = [
  {
    title: '成绩',
    name: 'scoreInquiry',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/grades.png'),
      android: require('../assets/images/icons/android/grades.png'),
    }),
    key: 'grid-1',
    href: '/scoreInquiry',
  },
  {
    title: '电费',
    name: 'electricityBillinQuiry',
    href: '/electricityBillinQuiry',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/energy.png'),
      android: require('../assets/images/icons/android/energy.png'),
    }),
    key: 'grid-2',
  },
  {
    title: '地图',
    name: 'map',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/map.png'),
      android: require('../assets/images/icons/android/map.png'),
    }),
    key: 'grid-3',
    href: '/map' as Href,
  },
  {
    title: '校园卡',
    name: 'card',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/card.png'),
      android: require('../assets/images/icons/android/card.png'),
    }),
    key: 'grid-4',
    href: '/schoolCard' as Href,
  },
  {
    title: '空闲教室',
    name: 'classroom',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/classroom.png'),
      android: require('../assets/images/icons/android/classroom.png'),
    }),
    key: 'grid-5',
    href: '/classroom' as Href,
  },
  {
    title: '蹭课',
    name: 'spaceLesson',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/lesson.png'),
      android: require('../assets/images/icons/android/lesson.png'),
    }),
    key: 'grid-6',
    href: '/spaceLesson' as Href,
  },
  {
    title: '部门信息',
    name: 'information',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/information.png'),
      android: require('../assets/images/icons/android/information.png'),
    }),
    key: 'grid-7',
    href: '/information' as Href,
  },
  {
    title: '校历',
    name: 'date',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/date.png'),
      android: require('../assets/images/icons/android/date.png'),
    }),
    key: 'grid-8',
    href: '/date' as Href,
  },
  {
    title: '常用网站',
    name: 'website',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/web.png'),
      android: require('../assets/images/icons/android/web.png'),
    }),
    key: 'grid-9',
    href: '/website' as Href,
  },
  {
    title: '木犀课栈',
    name: 'kestack',
    imageUrl: Platform.select({
      ios: require('../assets/images/icons/ios/kestack.png'),
      android: require('../assets/images/icons/android/kestack.png'),
    }),
    key: 'grid-10',
    href: '/kestack' as Href,
  },
];
