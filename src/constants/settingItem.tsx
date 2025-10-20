import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { deleteItemAsync } from 'expo-secure-store';

import Modal from '@/components/modal';

import { SettingItem } from '@/types/settingItem';

export const SettingItems: SettingItem[] = [
  {
    title: '界面样式设置',
    name: 'theme',
    id: 1,
    icon: require('@/assets/images/person.png'),
    text: '界面样式设置',
    to: '/(setting)/theme',
  },
  // {
  //   title: '分享',
  //   name: 'share',
  //   id: 2,
  //   icon: require('@/assets/images/share.png'),
  //   text: '分享',
  //   to: '/(setting)/share',
  // },
  {
    title: '检查更新',
    name: 'checkUpdate',
    id: 4,
    icon: require('@/assets/images/check-update.png'),
    text: '检查更新',
    to: '/(setting)/checkUpdate',
  },
  {
    title: '关于',
    name: 'about',
    id: 5,
    icon: require('@/assets/images/about.png'),
    text: '关于',
    to: '/(setting)/about',
  },
  {
    title: '退出',
    name: 'exit',
    id: 6,
    icon: require('@/assets/images/exit.png'),
    text: '退出',
    to: () => {
      const navigation = useRouter();
      Modal.show({
        mode: 'middle',
        title: '退出登录',
        children: '确定要退出登录吗？',
        confirmText: '确定',
        cancelText: '取消',
        onConfirm: () => {
          AsyncStorage.multiRemove(['courses']);
          deleteItemAsync('longToken').then(() => {
            navigation.replace('/auth/login');
          });
        },
      });
    },
  },
  {
    title: '注销账号',
    name: 'exit',
    id: 7,
    icon: require('@/assets/images/exit.png'),
    text: '退出',
    to: () => {
      const navigation = useRouter();
      Modal.show({
        mode: 'middle',
        title: '注销账号',
        children: '确定要注销账号吗？',
        confirmText: '确定',
        cancelText: '取消',
        onConfirm: () => {
          AsyncStorage.multiRemove(['courses']);
          deleteItemAsync('longToken').then(() => {
            navigation.replace('/auth/login');
          });
        },
      });
    },
  },
];
