//import * as Updates from 'expo-updates';
import React, { useState } from 'react';
import { Text } from 'react-native';

import Button from '@/components/button';
import Picker from '@/components/picker';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';
import View from '@/components/view';

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
  const [Layout, setLayout] = useState(layoutName);
  const isApplied = (layout: string) => layout === layoutName;
  return (
    <ThemeBasedView style={{ flex: 1 }}>
      <View>
        <Text style={currentStyle?.text_style}>原版</Text>
        <Button style={[currentStyle?.button_style, { width: '50%' }]}>
          {isApplied('android') ? '已应用' : '应用'}
        </Button>
      </View>
      <View>
        <Text style={currentStyle?.text_style}>IOS版</Text>
        <Button style={[currentStyle?.button_style, { width: '50%' }]}>
          {isApplied('ios') ? '已应用' : '应用'}
        </Button>
      </View>
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
