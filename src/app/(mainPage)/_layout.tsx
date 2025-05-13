import { Stack } from 'expo-router';
import * as React from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import { mainPageApplications } from '@/constants/mainPageApplications';
import { keyGenerator } from '@/utils';

import { MainPageGridDataType } from '@/types/mainPageGridTypes';

export default function Layout() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const currentComponents = useThemeBasedComponents(
    state => state.currentComponents
  );
  return (
    <View style={[styles.container]}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: 'white' },
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          headerBackVisible: false,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      >
        {mainPageApplications
          .filter(app => app.href)
          .concat({
            title: '常用网站',
            name: 'webview',
          } as MainPageGridDataType)
          .map(config => (
            <Stack.Screen
              key={keyGenerator.next().value as unknown as number}
              name={config.name}
              options={{
                headerTitleAlign: 'center',
                headerLeft: () => {
                  return (
                    <>
                      {currentComponents && (
                        <currentComponents.header_left title={config.title} />
                      )}
                    </>
                  );
                },
                headerTitle: () => (
                  <>
                    {currentComponents && (
                      <currentComponents.header_center
                        title={config.title}
                      ></currentComponents.header_center>
                    )}
                  </>
                ),
                headerStyle:
                  currentStyle?.header_background_style as StyleProp<{
                    backgroundColor: string | undefined;
                    flexDirection: 'row';
                    justifyContent: 'space-between'; // 确保 Header 内部均匀分布
                    alignItems: 'center';
                  }>,
              }}
            ></Stack.Screen>
          ))}
        <Stack.Screen
          name="scoreCalculation"
          options={{ headerShown: false }}
        ></Stack.Screen>
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
