import * as Updates from 'expo-updates';
import React, { useEffect } from 'react';
import { Text } from 'react-native';

import Button from '@/components/button';
import Modal from '@/components/modal';
import Picker from '@/components/picker';
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
          Updates.fetchUpdateAsync().then(r => console.log(r));
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
      <Picker>
        <Text style={currentStyle?.text_style}>345345</Text>
      </Picker>
    </ThemeBasedView>
  );
}
