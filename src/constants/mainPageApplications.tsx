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
    title: '木犀课栈',
    name: 'wechat',
    imageUrl: require('../assets/images/muxikezhan.png'),
    key: 'grid-wx',
    href: '/scoreInquiry',
  },
];
