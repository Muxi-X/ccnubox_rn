import { Href } from 'expo-router';

import { SettingItem } from '@/types/settingItem';

export const SettingItems: SettingItem[] = [
  {
    title: '个性化',
    name: 'theme',
    id: 1,
    icon: require('@/assets/images/person.png'),
    text: '个性化',
    url: '/(setting)/theme',
  },
  {
    title: '分享',
    name: 'share',
    id: 2,
    icon: require('@/assets/images/share.png'),
    text: '分享',
    url: '/(setting)/share' as Href<string>,
  },
  {
    title: '检查更新',
    name: 'checkUpdate',
    id: 4,
    icon: require('@/assets/images/check-update.png'),
    text: '检查更新',
    url: '/(setting)/checkUpdate',
  },
  {
    title: '关于',
    name: 'about',
    id: 5,
    icon: require('@/assets/images/about.png'),
    text: '关于',
    url: '/(setting)/about',
  },
  {
    title: '退出',
    name: 'exit',
    id: 6,
    icon: require('@/assets/images/exit.png'),
    text: '退出',
    url: '/(setting)/exit' as Href<string>,
  },
];
