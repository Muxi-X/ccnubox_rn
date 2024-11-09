import { router, Stack } from 'expo-router';
import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  StyleProp,
  TouchableOpacity,
  TextStyle,
} from 'react-native';
import { mainPageApplications } from '@/constants/mainPageApplications';
import { Ionicons } from '@expo/vector-icons';
import { keyGenerator } from '@/utils/autoKey';
import useVisualScheme from '@/store/visualScheme';
import { commonStyles } from '@/styles/common';

export default function Layout() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const handleNavBack = () => {
    router.back();
  };
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
              headerLeft: () => (
                <View style={styles.container}>
                  <TouchableOpacity onPress={handleNavBack}>
                    <Ionicons
                      name="arrow-back-outline"
                      size={commonStyles.fontLarge.fontSize}
                      color={(currentStyle?.text_style as TextStyle).color}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      currentStyle?.header_text_style,
                      commonStyles.TabBarPadding,
                      commonStyles.fontLarge,
                    ]}
                  >
                    {config.title}
                  </Text>
                </View>
              ),
              headerTitle: () => <></>,
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
