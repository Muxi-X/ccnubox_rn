import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import aboutPng from '@/assets/images/about.png';
import checkUpdatePng from '@/assets/images/check-update.png';
import exitPng from '@/assets/images/exit.png';
import feedbackPng from '@/assets/images/feedback.png';
import personPng from '@/assets/images/person.png';
import Modal from '@/components/modal';
import { clearHarmonyDebugSession } from '@/platform/harmonyDebugSession';
import { deleteItemAsync } from '@/platform/storage';
import { logout } from '@/request/api/auth';
import { removeFeedToken } from '@/request/api/feeds';
import usePushSubscriptionStore from '@/store/pushSubscription';
import useUserStore from '@/store/user';
import type { SettingItem } from '@/types/settingItem';
import { getPushToken } from '@/utils/pushToken';

export const SETTING_ITEMS: SettingItem[] = [
  {
    title: '界面样式设置',
    name: 'theme',
    id: 1,
    icon: personPng,
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
    icon: checkUpdatePng,
    text: '检查更新',
    to: '/(setting)/checkUpdate',
  },
  {
    title: '关于',
    name: 'about',
    id: 5,
    icon: aboutPng,
    text: '关于',
    to: '/(setting)/about',
  },
  {
    title: '帮助与反馈',
    name: 'feedback',
    id: 6,
    icon: feedbackPng,
    text: '帮助与反馈',
    to: '/(setting)/feedback',
    subTitle: '反馈历史',
    sub: '/(setting)/feedback/history',
  },
  {
    title: '退出',
    name: 'exit',
    id: 7,
    icon: exitPng,
    text: '退出',
    to: () => {
      Modal.show({
        mode: 'middle',
        title: '退出登录',
        children: '确定要退出登录吗？',
        confirmText: '确定',
        cancelText: '取消',
        onConfirm: async () => {
          try {
            // 退出前移除 feed token
            const pushToken =
              usePushSubscriptionStore.getState().registeredToken ||
              (await getPushToken(500));
            if (pushToken) {
              removeFeedToken(pushToken).catch(() => {});
            }
            usePushSubscriptionStore.getState().setRegisteredToken(null);
          } catch {
            // 忽略推送相关异常
          }

          try {
            await logout();
          } catch {
            // 忽略网络请求异常，确保本地登出成功
          }

          try {
            await Promise.all([
              AsyncStorage.multiRemove(['courses']),
              deleteItemAsync('longToken'),
              deleteItemAsync('shortToken'),
              clearHarmonyDebugSession(),
            ]);
            useUserStore.setState({ password: '' });
          } catch {
            // 忽略本地清理异常
          }

          Modal.clear();
          router.replace('/auth/login');
        },
      });
    },
  },
  {
    title: '注销账号',
    name: 'signOff',
    id: 8,
    icon: exitPng,
    text: '注销',
    to: '/(setting)/signOff',
  },
];
