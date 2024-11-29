import { SettingItem } from '@/types/settingItem';

export const SettingItems: SettingItem[] = [
  {
    title: 'theme',
    name: 'theme',
    id: 1,
    icon: require('@/assets/images/person.png'),
    text: '个性化',
    url: '/(setting)/theme',
  },
  {
    title: 'share',
    name: 'share',
    id: 2,
    icon: require('@/assets/images/share.png'),
    text: '分享',
    url: '/(setting)/share',
  },
  {
    title: 'help',
    name: 'help',
    id: 3,
    icon: require('@/assets/images/help.png'),
    text: '帮助与反馈',
    url: '/(setting)/help',
  },
  {
    title: 'checkUpdate',
    name: 'checkUpdate',
    id: 4,
    icon: require('@/assets/images/check-update.png'),
    text: '检查更新',
    url: '/(setting)/checkUpdate',
  },
  {
    title: 'about',
    name: 'about',
    id: 5,
    icon: require('@/assets/images/about.png'),
    text: '关于',
    url: '/(setting)/about',
  },
  {
    title: 'exit',
    name: 'exit',
    id: 6,
    icon: require('@/assets/images/exit.png'),
    text: '退出',
    url: '/(setting)/exit',
  },
];
