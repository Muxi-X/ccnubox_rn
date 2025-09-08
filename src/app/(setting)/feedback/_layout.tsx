import useVisualScheme from '@/store/visualScheme';
import { router, Stack } from 'expo-router';
import * as React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import { keyGenerator } from '@/utils';

const FeedbackItems = [
  { name: 'index', title: '帮助与反馈' },
  { name: 'history', title: '反馈历史' },
  { name: 'writefeedback', title: '我要反馈' },
];

export default function FeedbacksLayout() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const CurrentComponents = useThemeBasedComponents(
    state => state.CurrentComponents
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <Stack
        screenOptions={{
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          headerBackVisible: false,
        }}
      >
        {FeedbackItems.map(config => (
          <Stack.Screen
            key={keyGenerator.next().value as unknown as number}
            name={config.name}
            options={{
              headerShown: true,
              headerTitle: () => (
                <>
                  {CurrentComponents && (
                    <CurrentComponents.HeaderCenter title={config.title} />
                  )}
                  {config.name === 'index' && (
                    <TouchableOpacity
                      onPress={() => router.push('/feedback/history')}
                    >
                      <Text
                        style={{
                          marginLeft: -80,
                          fontSize: 14,
                          fontWeight: 400,
                          color: '#7B70F1',
                        }}
                      >
                        反馈历史
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ),
              headerStyle: {
                ...currentStyle?.header_background_style,
              } as StyleProp<{
                backgroundColor?: string;
                backgroundImage?: string;
                flexDirection: 'row';
                justifyContent: 'space-between';
                alignItems: 'center';
              }>,
            }}
          />
        ))}
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
