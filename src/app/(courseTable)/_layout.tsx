import { Stack } from 'expo-router';
import * as React from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import { courseTableApplications } from '@/constants/courseTableApplications';
import { keyGenerator } from '@/utils';

export default function Layout() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const CurrentComponents = useThemeBasedComponents(
    state => state.CurrentComponents
  );
  return (
    <View style={[styles.container]}>
      <Stack
        screenOptions={{
          headerBackVisible: false,
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
        }}
      >
        {courseTableApplications.map(config => (
          <Stack.Screen
            key={keyGenerator.next().value as unknown as number}
            name={config.name}
            options={{
              headerTitle: () => (
                <>
                  {CurrentComponents && (
                    <CurrentComponents.HeaderCenter
                      title={config.title}
                    />
                  )}
                </>
              ),
              headerStyle: currentStyle?.header_background_style as StyleProp<{
                backgroundColor: string | undefined;
              }>,
            }}
          ></Stack.Screen>
        ))}
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
