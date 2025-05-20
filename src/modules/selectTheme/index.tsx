import * as React from 'react';
import { Image, Text, TextStyle } from 'react-native';

import Button from '@/components/button';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

export default function SelectTheme() {
  const { currentStyle, themeName, layoutName, changeLayout } = useVisualScheme(
    ({ currentStyle, layoutName, changeTheme, changeLayout, themeName }) => ({
      currentStyle,
      changeTheme,
      themeName,
      layoutName,
      changeLayout,
    })
  );
  const isApplied = (layout: string) => layout === layoutName;
  return (
    <ThemeBasedView style={{ flex: 1, paddingVertical: 20 }}>
      <ThemeBasedView
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Text
          style={[
            currentStyle?.text_style as TextStyle,
            {
              fontSize: 18,
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
          ]}
          onPress={() => {
            if (!isApplied('android')) {
              changeLayout(layoutName === 'android' ? 'ios' : 'android');
            }
          }}
        >
          {isApplied('android') ? '已应用' : '应用'}
        </Button>
      </ThemeBasedView>
      <Image
        source={
          themeName === 'dark'
            ? require('@/assets/images/theme/baseDark.png')
            : require('@/assets/images/theme/base.png')
        }
        style={{
          justifyContent: 'center',
          marginTop: 20,
          width: 300,
          height: 180,
          alignSelf: 'center',
          resizeMode: 'cover',
        }}
      />
      <ThemeBasedView
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          display: 'flex',
          alignItems: 'center',
          marginTop: 20,
        }}
      >
        <Text
          style={[
            currentStyle?.text_style as TextStyle,
            {
              fontSize: 18,
              paddingLeft: 40,
            },
          ]}
        >
          IOS版
        </Text>
        <Button
          style={[
            currentStyle?.button_style,
            { width: '40%', borderRadius: 10, marginRight: 10 },
          ]}
          onPress={() => {
            if (!isApplied('ios')) {
              changeLayout(layoutName === 'android' ? 'ios' : 'android');
            }
          }}
        >
          {isApplied('ios') ? '已应用' : '应用'}
        </Button>
      </ThemeBasedView>
      <Image
        source={
          themeName === 'dark'
            ? require('@/assets/images/theme/iosDark.png')
            : require('@/assets/images/theme/ios.png')
        }
        style={{
          justifyContent: 'center',
          marginTop: 20,
          width: 300,
          height: 200,
          alignSelf: 'center',
          resizeMode: 'cover',
        }}
      />
    </ThemeBasedView>
  );
}
