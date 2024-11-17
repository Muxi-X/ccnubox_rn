import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';

import Button from '@/components/button';
import Modal from '@/components/modal';
import Picker from '@/components/picker';
import Text from '@/components/text';
import Toast from '@/components/toast';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import SettingItem from '@/module/setting/components/settingItem';
const ListItem = [
  {
    id: 1,
    icon: require('@/assets/images/person.png'),
    text: '个性化',
    url: 'test1',
  },
  {
    id: 2,
    icon: require('@/assets/images/share.png'),
    text: '分享',
    url: '@/assets/images/png',
  },
  {
    id: 3,
    icon: require('@/assets/images/help.png'),
    text: '帮助与反馈',
    url: '@/assets/images/share.png',
  },
  {
    id: 4,
    icon: require('@/assets/images/check-update.png'),
    text: '检查更新',
    url: '@/assets/images/share.png',
  },
  {
    id: 5,
    icon: require('@/assets/images/about.png'),
    text: '关于',
    url: '@/assets/images/share.png',
  },
  {
    id: 6,
    icon: require('@/assets/images/exit.png'),
    text: '退出',
    url: '@/assets/images/share.png',
  },
];
export default function SettingPage() {
  const { currentStyle, layoutName, themeName, changeLayout, changeTheme } =
    useVisualScheme(
      ({ currentStyle, layoutName, changeTheme, changeLayout, themeName }) => ({
        currentStyle,
        changeTheme,
        themeName,
        layoutName,
        changeLayout,
      })
    );
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (isUpdatePending) {
      void Updates.reloadAsync();
    }
  }, [isUpdatePending]);
  useEffect(() => {
    isUpdateAvailable &&
      Modal.show({
        title: '检测到更新',
        children: '是否更新',
        onConfirm: () => {
          Updates.fetchUpdateAsync();
        },
      });
  }, [isUpdateAvailable]);

  return (
    <ThemeBasedView style={{ flex: 1 }}>
      <FlatList
        data={ListItem}
        renderItem={({ item }) => (
          <SettingItem icon={item.icon} text={item.text} url={item.url} />
        )}
        keyExtractor={item => item.id.toString()}
        // contentContainerStyle={styles.listContainer}
      />
      <Button
        style={[currentStyle?.button_style, { width: '100%' }]}
        onPress={() => {
          changeTheme(themeName === 'dark' ? 'light' : 'dark');
        }}
      >
        切换模式
      </Button>
      <Button
        onPress={() => {
          changeLayout(layoutName === 'android' ? 'ios' : 'android');
        }}
        style={[currentStyle?.button_style, { width: '100%' }]}
      >
        {'切换主题,当前主题：' + layoutName}
      </Button>
      <Button
        style={[currentStyle?.button_style, { width: '100%' }]}
        onPress={() => {
          setLoading(true);
          Updates.checkForUpdateAsync()
            .then(res => {
              if (!res.isAvailable) {
                Toast.show({ text: '已是最新版', icon: 'success' });
              }
            })
            .catch(err => {
              Toast.show({ text: '我是谁' });
            })
            .finally(() => {
              setLoading(false);
            });
        }}
        isLoading={loading}
        children="检查更新"
      />
      <StatusBar style="auto" />
      <Picker>
        <Text style={currentStyle?.text_style}>345345</Text>
      </Picker>
    </ThemeBasedView>
  );
}
