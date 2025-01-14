import React from 'react';
import { Text } from 'react-native';

import Button from '@/components/button';
// eslint-disable-next-line import/no-duplicates
import ThemeBasedView from '@/components/view';
// eslint-disable-next-line import/no-duplicates,no-duplicate-imports
import View from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

export default function SelectTheme() {
  const { currentStyle, layoutName, changeLayout } = useVisualScheme(
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
      <View>
        <Text style={currentStyle?.text_style}>原版</Text>
        <Button
          style={[
            currentStyle?.button_style,
            { width: '40%' },
            isApplied('android')
              ? { backgroundColor: 'purple' }
              : { backgroundColor: 'white' },
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
      <View>
        <Text style={currentStyle?.text_style}>IOS版</Text>
        <Button
          style={[
            currentStyle?.button_style,
            { width: '40%' },
            isApplied('ios')
              ? { backgroundColor: 'purple' }
              : { backgroundColor: 'white' },
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
    </ThemeBasedView>
  );
}
