import { Platform } from 'react-native';

import { FeedIconTypes } from '@/types/FeedIconTypes';

export const FeedIconList: FeedIconTypes[] = [
  {
    imageUrl: Platform.select({
      android: require('@/assets/images/icons/android/a-grade.png'),
      ios: require('@/assets/images/icons/ios/i-grade.png'),
    }),
    text: '成绩',
    name: 'grade',
  },
  {
    name: 'muxi',
    imageUrl: Platform.select({
      android: require('@/assets/images/icons/android/a-muxi.png'),
      ios: require('@/assets/images/icons/ios/i-muxi.png'),
    }),
    text: '木犀官方',
  },
  {
    name: 'holiday',
    imageUrl: Platform.select({
      android: require('@/assets/images/icons/android/a-holiday.png'),
      ios: require('@/assets/images/icons/ios/i-holiday.png'),
    }),
    text: '假期临近',
  },
  {
    name: 'air_conditioner',
    imageUrl: Platform.select({
      android: require('@/assets/images/icons/android/a-air.png'),
      ios: require('@/assets/images/icons/ios/i-air.png'),
    }),
    text: '空调电费告急',
  },
  {
    name: 'light',
    imageUrl: Platform.select({
      android: require('@/assets/images/icons/android/a-light.png'),
      ios: require('@/assets/images/icons/ios/i-light.png'),
    }),
    text: '照明电费告急',
  },
];
