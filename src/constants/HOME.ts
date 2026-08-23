import { Href } from 'expo-router';

import { homeGridIcons } from '@/assets/icons';
import { handleOpenURL } from '@/utils/handleOpenURL';

export const HOME_ITEMS = [
  {
    title: '查算学分绩',
    name: 'scoreInquiry',
    Icon: homeGridIcons.grades,
    key: 'grid-1',
    href: '/scoreInquiry',
  },
  {
    title: '电费查询',
    name: 'electricity',
    href: '/electricity',
    Icon: homeGridIcons.energy,
    key: 'grid-2',
  },
  {
    title: '地图',
    name: 'map',
    Icon: homeGridIcons.map,
    key: 'grid-3',
    href: '/map' as Href,
  },
  {
    title: '校园卡',
    name: 'schoolCard',
    Icon: homeGridIcons.card,
    key: 'grid-4',
    action: () =>
      handleOpenURL(
        'alipays://platformapi/startapp?appId=2021004168660064',
        '支付宝'
      ),
  },
  {
    title: '空闲教室',
    name: 'classroom',
    Icon: homeGridIcons.classroom,
    key: 'grid-5',
    href: '/classroom' as Href,
  },
  // {
  //   title: '蹭课',
  //   name: 'spaceLesson',
  //   Icon: homeGridIcons.lesson,
  //   key: 'grid-6',
  //   href: '/spaceLesson' as Href,
  // },
  {
    title: '部门信息',
    name: 'departments',
    Icon: homeGridIcons.information,
    key: 'grid-7',
    href: '/departments' as Href,
  },
  {
    title: '校历',
    name: 'calendar',
    Icon: homeGridIcons.date,
    key: 'grid-8',
    href: '/calendar' as Href,
  },
  {
    title: '常用网站',
    name: 'websites',
    Icon: homeGridIcons.web,
    key: 'grid-9',
    href: '/websites' as Href,
  },
  {
    title: '木犀课栈',
    name: 'kestack',
    Icon: homeGridIcons.kestack,
    key: 'grid-10',
    // action: () => {
    //   // 暂时还不能用，等课栈提供生成加密 URL Scheme的接口
    //   handleOpenURL('weixin://dl/business/?appid=wx6220588048f6e417', '微信');
    // },
    href: '/kestack' as Href,
  },
  // {
  //   title: '信息整合',
  //   name: 'all',
  //   Icon: homeGridIcons.all,
  //   key: 'grid-11',
  //   href: '/all' as Href,
  // },
  // 旧版座位预约
  // {
  //   title: '座位预约',
  //   name: 'site',
  //   Icon: homeGridIcons.seat,
  //   key: 'grid-12',
  //   href: `/(mainPage)/webview?link=${btoa('https://account.ccnu.edu.cn/cas/login?service=http://kjyy.ccnu.edu.cn/loginall.aspx?page=&pageId=1053906&wfwfid=1740&websiteId=548973')}` as Href,
  // },
  {
    title: '座位预约',
    name: 'site',
    Icon: homeGridIcons.seat,
    key: 'grid-12',
    href: `/(mainPage)/webview?title=座位预约&link=${btoa('https://account.ccnu.edu.cn/cas/login?service=https%3A%2F%2Fkjyy.ccnu.edu.cn%2Frem%2Fstatic%2Fsso%2FwebOAuthRed')}` as Href,
  },
  {
    title: '校灵通',
    name: 'eventGlide',
    Icon: homeGridIcons.eventGlide,
    key: 'grid-14',
    action: () =>
      handleOpenURL(
        'weixin://dl/business/?appid=wx326be910b0f5468c&path=pages/main/index',
        '微信'
      ),
  },
  {
    title: '更多',
    name: 'more',
    Icon: homeGridIcons.more,
    key: 'grid-13',
    href: '/more' as Href,
    disabledDrag: true,
  },
  // {
  //   title: '更新小组件',
  //   name: 'updateWidget',
  //   Icon: homeGridIcons.more,
  //   key: 'grid-14',
  //   action: () =>
  //     updateCourseData()
  //       .then(() => {
  //         console.log('updateWidget');
  //       })
  //       .catch(error => {
  //         console.error('更新小组件失败:', error);
  //       }),
  // },
];
