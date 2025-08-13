import { Stack } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

export default function Layout() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  return (
    <View style={[styles.container]}>
      <Stack
        screenOptions={{
          headerBackVisible: false,
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
        }}
      ></Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
