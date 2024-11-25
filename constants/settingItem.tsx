import { Href } from 'expo-router';

export const SettingItems = [
  {
    id: 1,
    icon: require('@/assets/images/person.png'),
    text: '个性化',
    url: '/(setting)/theme' as Href<string>,
  },
  {
    id: 2,
    icon: require('@/assets/images/share.png'),
    text: '分享',
    url: '/(setting)/theme' as Href<string>,
  },
  {
    id: 3,
    icon: require('@/assets/images/help.png'),
    text: '帮助与反馈',
    url: '/(setting)/theme' as Href<string>,
  },
  {
    id: 4,
    icon: require('@/assets/images/check-update.png'),
    text: '检查更新',
    url: '/(setting)/theme' as Href<string>,
  },
  {
    id: 5,
    icon: require('@/assets/images/about.png'),
    text: '关于',
    url: '/(setting)/theme' as Href<string>,
  },
  {
    id: 6,
    icon: require('@/assets/images/exit.png'),
    text: '退出',
    url: '/(setting)/theme' as Href<string>,
  },
];
