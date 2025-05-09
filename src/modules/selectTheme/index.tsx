import * as React from 'react';
import { Image, Text } from 'react-native';

import Button from '@/components/button';
// eslint-disable-next-line import/no-duplicates
import ThemeBasedView from '@/components/view';
// eslint-disable-next-line import/no-duplicates,no-duplicate-imports
import View from '@/components/view';

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
      </View>
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
      <View
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
            currentStyle?.text_style,
            {
              fontSize: 16,
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
      </View>
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
