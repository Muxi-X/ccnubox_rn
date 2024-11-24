import { Stack } from 'expo-router';
import React from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import { mainPageApplications } from '@/constants/mainPageApplications';
import { keyGenerator } from '@/utils/autoKey';

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
        {mainPageApplications.map(config => (
          <Stack.Screen
            key={keyGenerator.next().value as unknown as number}
            name={config.name}
            options={{
              // headerLeft: () => {
              //   return (
              //     <>
              //       {currentComponents && (
              //         <currentComponents.header_left title={config.title} />
              //       )}
              //     </>
              //   );
              // },
              // headerTitle: () => (
              //   <>
              //     {currentComponents && (
              //       <currentComponents.header_center
              //         title={config.title}
              //       ></currentComponents.header_center>
              //     )}
              //   </>
              // ),
              headerStyle: currentStyle?.header_background_style as StyleProp<{
                backgroundColor: string | undefined;
              }>,
              title: config.title,
            }}
          ></Stack.Screen>
        ))}
        <Stack.Screen
          name="electricityBillBalance"
          options={{
            title: '电费余额',
            headerStyle: {
              backgroundColor: '#F7F7F7',
            },
          }}
        />
        <Stack.Screen
          name="scoreCalculation"
          options={{
            headerShown: false,
            headerStyle: {
              backgroundColor: '#F7F7F7',
            },
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
