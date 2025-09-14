import * as React from 'react';
import { Image, Text, View } from 'react-native';

import Button from '@/components/button';
import ThemeBasedView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';
export default function SelectStyle() {
  const { currentStyle, themeName, changeTheme, isAutoTheme, setAutoTheme } =
    useVisualScheme(
      ({
        currentStyle,
        layoutName,
        changeTheme,
        changeLayout,
        setAutoTheme,
        themeName,
        isAutoTheme,
      }) => ({
        currentStyle,
        changeTheme,
        themeName,
        layoutName,
        changeLayout,
        isAutoTheme,
        setAutoTheme,
      })
    );
  const isApplied = (layout: string) => layout === themeName;
  return (
    <ThemeBasedView style={{ flex: 1, paddingVertical: 20 }}>
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
            { width: '40%', borderRadius: 10, marginRight: 10 },
            isAutoTheme && { opacity: 0.4 },
          ]}
          onPress={() => {
            if (!isApplied('dark') && !isAutoTheme) {
              changeTheme(themeName === 'dark' ? 'light' : 'dark');
            }
          }}
        >
          {isAutoTheme ? '应用' : isApplied('dark') ? '已应用' : '应用'}
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
              fontSize: 18,
              paddingLeft: 40,
            },
          ]}
        >
          普通模式
        </Text>
        <Button
          style={[
            { width: '40%', borderRadius: 10, marginRight: 10 },
            isAutoTheme && { opacity: 0.4 },
          ]}
          onPress={() => {
            if (!isApplied('light') && !isAutoTheme) {
              changeTheme(themeName === 'dark' ? 'light' : 'dark');
            }
          }}
        >
          {isAutoTheme ? '应用' : isApplied('light') ? '已应用' : '应用'}
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
              fontSize: 18,
              paddingLeft: 40,
            },
          ]}
        >
          默认模式
        </Text>
        <Button
          style={[{ width: '40%', borderRadius: 10, marginRight: 10 }]}
          onPress={() => {
            setAutoTheme(isAutoTheme);
          }}
        >
          {isAutoTheme ? '已应用' : '应用'}
        </Button>
      </View>
    </ThemeBasedView>
  );
}
