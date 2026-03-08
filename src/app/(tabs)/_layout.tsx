import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform, Text } from 'react-native';

import Modal from '@/components/modal';
import TabBar from '@/components/navi';
import Toast from '@/components/toast';

import usePushSubscriptionStore from '@/store/pushSubscription';
import useVisualScheme from '@/store/visualScheme';

import { TABS } from '@/constants/tabBar';
import PushSubscriptionPromptContent from '@/modules/setting/components/PushSubscriptionPromptContent';
import { keyGenerator } from '@/utils';
import {
  enablePushSubscription,
  syncPushSubscription,
} from '@/utils/pushSubscription';

import { SinglePageType } from '@/types/tabBarTypes';

export default function TabLayout() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const promptTriggeredRef = useRef(false);
  const { enabled, hydrated, promptShown, setPromptShown } =
    usePushSubscriptionStore(state => ({
      enabled: state.enabled,
      hydrated: state.hydrated,
      promptShown: state.promptShown,
      setPromptShown: state.setPromptShown,
    }));

  useEffect(() => {
    if (!enabled) return;
    syncPushSubscription().catch(() => {});
  }, [enabled]);

  useEffect(() => {
    if (!hydrated || enabled || promptShown || promptTriggeredRef.current) {
      return;
    }

    promptTriggeredRef.current = true;
    Modal.show({
      mode: 'middle',
      title: '订阅消息推送',
      children: <PushSubscriptionPromptContent />,
      confirmText: '确定',
      cancelText: '取消',
      onClose: () => {
        setPromptShown(true);
      },
      onConfirm: () => {
        void enablePushSubscription()
          .then(() => {
            Toast.show({
              icon: 'success',
              text: '已开启消息推送',
            });
          })
          .catch(error => {
            Toast.show({
              icon: 'fail',
              text: error instanceof Error ? error.message : '开启消息推送失败',
            });
          });
      },
    });
  }, [enabled, hydrated, promptShown, setPromptShown]);

  const render = (configs: SinglePageType[]) =>
    configs.map(config => {
      const { name, title, headerTitle, headerRight, headerLeft } = config;
      return (
        <Tabs.Screen
          name={name}
          key={keyGenerator.next().value as unknown as number}
          options={{
            title: title,
            lazy: false,
            headerTitle:
              headerTitle ??
              (() => (
                <Text style={currentStyle?.header_text_style}>{title}</Text>
              )),
            headerRight: headerRight,
            headerLeft: headerLeft,
            headerTitleAlign: 'center',
            tabBarStyle: currentStyle?.schedule_background_style,
            headerStyle: [
              currentStyle?.schedule_background_style,
              Platform.select({
                ios: {
                  height: 120,
                },
              }),
            ],
          }}
        />
      );
    });
  return (
    <Tabs initialRouteName="schedule" tabBar={props => <TabBar {...props} />}>
      {render(TABS)}
    </Tabs>
  );
}
