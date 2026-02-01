import { Platform } from 'react-native';

import type { FeedIconTypes } from '@/types/FeedIconTypes';

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
    name: 'energy',
    imageUrl: Platform.select({
      android: require('@/assets/images/icons/android/a-air.png'),
      ios: require('@/assets/images/icons/ios/i-air.png'),
    }),
    text: '电费告急',
  },
  {
    name: 'feedback',
    imageUrl: Platform.select({
      android: require('@/assets/images/icons/android/feedback.png'),
      ios: require('@/assets/images/icons/ios/feedback.png'),
    }),
    text: '反馈',
  },
];
