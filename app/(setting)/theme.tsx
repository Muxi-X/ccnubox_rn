import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';

import Button from '@/components/button';
import Modal from '@/components/modal';
import Picker from '@/components/picker';
import Toast from '@/components/toast';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

export default function Theme() {
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
  const [loading, setLoading] = useState(false);
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
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
      >
        检查更新
      </Button>
      <Picker>
        <Text style={currentStyle?.text_style}>345345</Text>
      </Picker>
    </ThemeBasedView>
  );
}
