import { Stack } from 'expo-router';
import * as React from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

export default function Layout() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));

  const CurrentComponents = useThemeBasedComponents(
    state => state.CurrentComponents
  );

  const headerStyle = currentStyle?.header_background_style as StyleProp<{
    backgroundColor: string | undefined;
    flexDirection: 'row';
    justifyContent: 'space-between'; // 确保 Header 内部均匀分布
    alignItems: 'center';
  }>;

  return (
    <View style={[styles.container]}>
      <Stack
        screenOptions={{
          headerBackVisible: false,
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          headerStyle: headerStyle,
        }}
      >
        <Stack.Screen
          name="selectSeat"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="座位预约" />
                )}
              </>
            ),
          }}
        />
      </Stack>
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
