import * as React from 'react';
import { Image, Text } from 'react-native';

import Button from '@/components/button';
// eslint-disable-next-line import/no-duplicates
import ThemeBasedView from '@/components/view';
// eslint-disable-next-line import/no-duplicates,no-duplicate-imports
import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

export default function SelectStyle() {
  const { currentStyle, themeName, changeTheme } = useVisualScheme(
    ({ currentStyle, layoutName, changeTheme, changeLayout, themeName }) => ({
      currentStyle,
      changeTheme,
      themeName,
      layoutName,
      changeLayout,
    })
  );
  const isApplied = (layout: string) => layout === themeName;
  return (
    <ThemeBasedView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Text
          style={[
            currentStyle?.text_style,
            {
              fontSize: 18,
              paddingLeft: 40,
            },
          ]}
        >
          深夜模式
        </Text>
        <Button
          style={[
            currentStyle?.button_style,
            { width: '40%', borderRadius: 10, marginRight: 10 },
            isApplied('dark')
              ? { backgroundColor: 'purple' }
              : { backgroundColor: 'white' },
          ]}
          onPress={() => {
            if (!isApplied('android')) {
              changeTheme(themeName === 'dark' ? 'light' : 'dark');
            }
          }}
        >
          {isApplied('dark') ? '已应用' : '应用'}
        </Button>
      </View>
      <Image
        source={require('@/assets/images/theme/darkStyle.png')}
        style={{
          borderRadius: 60,
          justifyContent: 'center',
          marginTop: 20,
          width: 300,
          height: 180,
          alignSelf: 'center',
          resizeMode: 'contain',
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          display: 'flex',
          alignItems: 'center',
          marginTop: 40,
        }}
      >
        <Text
          style={[
            currentStyle?.text_style,
            {
              fontSize: 16,
              paddingLeft: 40,
            },
          ]}
        >
          原版
        </Text>
        <Button
          style={[
            currentStyle?.button_style,
            { width: '40%', borderRadius: 10, marginRight: 10 },
            isApplied('ios')
              ? { backgroundColor: 'purple' }
              : { backgroundColor: 'white' },
          ]}
          onPress={() => {
            if (!isApplied('light')) {
              changeTheme(themeName === 'dark' ? 'light' : 'dark');
            }
          }}
        >
          {isApplied('light') ? '已应用' : '应用'}
        </Button>
      </View>
      <Image
        source={require('@/assets/images/theme/baseStyle.png')}
        style={{
          borderRadius: 20,
          justifyContent: 'center',
          marginTop: 20,
          width: 300,
          height: 100,
          alignSelf: 'center',
          resizeMode: 'contain',
        }}
      />
    </ThemeBasedView>
  );
}
