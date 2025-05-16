import { Href } from 'expo-router';
import { Platform } from 'react-native';

import AndroidCardSvg from '@/assets/images/icons/android/card.svg';
import AndroidDateSvg from '@/assets/images/icons/android/date.svg';
import AndroidEnergySvg from '@/assets/images/icons/android/energy.svg';
import AndroidGradesSvg from '@/assets/images/icons/android/grades.svg';
import AndroidInformationSvg from '@/assets/images/icons/android/information.svg';
import AndroidMapSvg from '@/assets/images/icons/android/map.svg';
import AndroidMoreSvg from '@/assets/images/icons/android/more.svg';
import AndroidSiteSvg from '@/assets/images/icons/android/site.svg';
import AndroidWebSvg from '@/assets/images/icons/android/web.svg';
import IosCardSvg from '@/assets/images/icons/ios/card.svg';
import IosDateSvg from '@/assets/images/icons/ios/date.svg';
import IosEnergySvg from '@/assets/images/icons/ios/energy.svg';
import IosGradesSvg from '@/assets/images/icons/ios/grades.svg';
import IosInformationSvg from '@/assets/images/icons/ios/information.svg';
import IosMapSvg from '@/assets/images/icons/ios/map.svg';
import IosMoreSvg from '@/assets/images/icons/ios/more.svg';
import IosSiteSvg from '@/assets/images/icons/ios/site.svg';
import IosWebSvg from '@/assets/images/icons/ios/web.svg';
import { handleOpenURL } from '@/utils';

import { MainPageGridDataType } from '@/types/mainPageGridTypes';

export const mainPageApplications: MainPageGridDataType[] = [
  {
    title: '查算学分绩',
    name: 'scoreInquiry',
    imageUrl:
      Platform.select({
        ios: IosGradesSvg,
        android: AndroidGradesSvg,
      }) || AndroidGradesSvg,
    key: 'grid-1',
    href: '/scoreInquiry',
  },
  {
    title: '电费',
    name: 'electricity',
    href: '/electricity',
    imageUrl:
      Platform.select({
        ios: IosEnergySvg,
        android: AndroidEnergySvg,
      }) || AndroidEnergySvg,
    key: 'grid-2',
  },
  {
    title: '地图',
    name: 'map',
    imageUrl:
      Platform.select({
        ios: IosMapSvg,
        android: AndroidMapSvg,
      }) || AndroidMapSvg,
    key: 'grid-3',
    href: '/map' as Href,
  },
  {
    title: '校园卡',
    name: 'schoolCard',
    imageUrl:
      Platform.select({
        ios: IosCardSvg,
        android: AndroidCardSvg,
      }) || AndroidCardSvg,
    key: 'grid-4',
    action: () =>
      handleOpenURL(
        'alipays://platformapi/startapp?appId=2021004168660064',
        '支付宝'
      ),
  },
  // {
  //   title: '空闲教室',
  //   name: 'classroom',
  //   imageUrl: Platform.select({
  //     ios: require('../assets/images/icons/ios/classroom.png'),
  //     android: require('../assets/images/icons/android/classroom.png'),
  //   }),
  //   key: 'grid-5',
  //   href: '/classroom' as Href,
  // },
  // {
  //   title: '蹭课',
  //   name: 'spaceLesson',
  //   imageUrl: Platform.select({
  //     ios: require('../assets/images/icons/ios/lesson.png'),
  //     android: require('../assets/images/icons/android/lesson.png'),
  //   }),
  //   key: 'grid-6',
  //   href: '/spaceLesson' as Href,
  // },
  {
    title: '部门信息',
    name: 'departments',
    imageUrl:
      Platform.select({
        ios: IosInformationSvg,
        android: AndroidInformationSvg,
      }) || AndroidInformationSvg,
    key: 'grid-7',
    href: '/departments' as Href,
  },
  {
    title: '校历',
    name: 'calendar',
    imageUrl:
      Platform.select({
        ios: IosDateSvg,
        android: AndroidDateSvg,
      }) || AndroidDateSvg,
    key: 'grid-8',
    href: '/calendar' as Href,
  },
  {
    title: '常用网站',
    name: 'websites',
    imageUrl:
      Platform.select({
        ios: IosWebSvg,
        android: AndroidWebSvg,
      }) || AndroidWebSvg,
    key: 'grid-9',
    href: '/websites' as Href,
  },
  // {
  //   title: '木犀课栈',
  //   name: 'kestack',
  //   imageUrl: Platform.select({
  //     ios: require('../assets/images/icons/ios/kestack.png'),
  //     android: require('../assets/images/icons/android/kestack.png'),
  //   }),
  //   key: 'grid-10',
  //   action: () => {
  //     // 暂时还不能用，等课栈提供生成加密 URL Scheme的接口
  //     handleOpenURL('weixin://dl/business/?appid=wx6220588048f6e417', '微信');
  //   },
  // },
  // {
  //   title: '信息整合',
  //   name: 'all',
  //   imageUrl: Platform.select({
  //     ios: require('../assets/images/icons/ios/all.png'),
  //     android: require('../assets/images/icons/android/all.png'),
  //   }),
  //   key: 'grid-11',
  //   href: '/all' as Href,
  // },
  {
    title: '座位预约',
    imageUrl:
      Platform.select({
        ios: IosSiteSvg,
        android: AndroidSiteSvg,
      }) || AndroidSiteSvg,
    key: 'grid-12',
    href: `/(mainPage)/webview?link=${btoa('https://account.ccnu.edu.cn/cas/login?service=http://kjyy.ccnu.edu.cn/loginall.aspx?page=&pageId=1053906&wfwfid=1740&websiteId=548973')}` as Href,
  },
  {
    title: '更多',
    name: 'more',
    imageUrl:
      Platform.select({
        ios: IosMoreSvg,
        android: AndroidMoreSvg,
      }) || AndroidMoreSvg,
    key: 'grid-13',
    href: '/more' as Href,
  },
];
