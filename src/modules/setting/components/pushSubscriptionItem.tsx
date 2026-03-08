import { Switch } from '@ant-design/react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Modal from '@/components/modal';
import Toast from '@/components/toast';

import usePushSubscriptionStore from '@/store/pushSubscription';
import useVisualScheme from '@/store/visualScheme';

import { commonColors } from '@/styles/common';
import {
  disablePushSubscription,
  enablePushSubscription,
} from '@/utils/pushSubscription';

import PushSubscriptionPromptContent from './PushSubscriptionPromptContent';

function PushSubscriptionItem() {
  const currentScheme = useVisualScheme(state => state.currentStyle);
  const enabled = usePushSubscriptionStore(state => state.enabled);
  const [loading, setLoading] = useState(false);

  const confirmEnable = async () => {
    setLoading(true);
    try {
      await enablePushSubscription();
      Toast.show({
        icon: 'success',
        text: '已开启消息推送',
      });
    } catch (error) {
      Toast.show({
        icon: 'fail',
        text: error instanceof Error ? error.message : '开启消息推送失败',
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDisable = async () => {
    setLoading(true);
    try {
      await disablePushSubscription();
      Toast.show({
        icon: 'success',
        text: '已关闭消息推送',
      });
    } catch (error) {
      Toast.show({
        icon: 'fail',
        text: error instanceof Error ? error.message : '关闭消息推送失败',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEnableModal = () => {
    Modal.show({
      mode: 'middle',
      title: '订阅消息推送',
      children: <PushSubscriptionPromptContent />,
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: () => {
        void confirmEnable();
      },
    });
  };

  const openDisableModal = () => {
    Modal.show({
      mode: 'middle',
      title: '关闭消息推送',
      children: '关闭后将不再收到消息提醒，可在设置中重新开启。',
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: () => {
        void confirmDisable();
      },
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    if (loading) return;
    if (checked) {
      openEnableModal();
      return;
    }
    openDisableModal();
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <MaterialIcons
          name="notifications-active"
          size={22}
          color={commonColors.purple}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, currentScheme?.text_style]}>消息推送</Text>
        <Text style={[styles.subtitle, currentScheme?.notification_text_style]}>
          {enabled ? '已订阅，接收校园消息提醒' : '默认关闭，确认后才会订阅'}
        </Text>
      </View>
      <Switch
        checked={enabled}
        disabled={loading}
        onChange={handleSwitchChange}
        style={styles.switch}
        trackColor={{ false: '#ECEBFF', true: '#C9B7FF' }}
        thumbColor={loading ? '#B9B9B9' : '#979797'}
      />
    </View>
  );
}

export default PushSubscriptionItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  switch: {
    width: 40,
    height: 20,
  },
});
