import { Stack } from 'expo-router';
import * as React from 'react';
import { StyleProp, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import { mainPageApplications } from '@/constants/mainPageApplications';
import { keyGenerator } from '@/utils';

import { MainPageGridDataType } from '@/types/mainPageGridTypes';

export default function Layout() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const CurrentComponents = useThemeBasedComponents(
    state => state.CurrentComponents
  );
  return (
    <SafeAreaView edges={['bottom']} style={[styles.container]}>
      <Stack
        screenOptions={{
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          headerBackVisible: false,
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
                // 为 classroom 隐藏默认 header
                headerShown: config.name === 'classroom' ? false : undefined,
                headerTitle:
                  config.name === 'classroom'
                    ? undefined
                    : () => (
                        <>
                          {CurrentComponents && (
                            <CurrentComponents.HeaderCenter
                              title={config.title}
                            />
                          )}
                        </>
                      ),
                headerStyle:
                  config.name === 'classroom'
                    ? undefined
                    : (currentStyle?.header_background_style as StyleProp<{
                        backgroundColor: string | undefined;
                        flexDirection: 'row';
                        justifyContent: 'space-between'; // 确保 Header 内部均匀分布
                        alignItems: 'center';
                      }>),
              }}
            ></Stack.Screen>
          ))
          .filter(item => item)}
        <Stack.Screen
          name="scoreCalculation"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="classroomStar"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="我的收藏" />
                )}
              </>
            ),
            headerStyle: currentStyle?.header_background_style as StyleProp<{
              backgroundColor: string | undefined;
              flexDirection: 'row';
              justifyContent: 'space-between';
              alignItems: 'center';
            }>,
          }}
        ></Stack.Screen>
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
