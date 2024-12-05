import { Stack } from 'expo-router';
import React from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import { keyGenerator } from '@/utils/autoKey';
import { addItem } from '@/module/courseTable/TooltipContent';

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
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          headerBackButtonMenuEnabled: true,
        }}
      >
        {addItem.map(config => (
          <Stack.Screen
            key={keyGenerator.next().value as unknown as number}
            name={config.text}
            options={{
              headerLeft: () => {
                return (
                  <>
                    {currentComponents && (
                      <currentComponents.header_left title={config.text} />
                    )}
                  </>
                );
              },
              headerTitle: () => (
                <>
                  {currentComponents && (
                    <currentComponents.header_center
                      title={config.text}
                    ></currentComponents.header_center>
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
