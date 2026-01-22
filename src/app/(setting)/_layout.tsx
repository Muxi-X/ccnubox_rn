import { Stack } from 'expo-router';
import { StyleProp, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import { SETTING_ITEMS } from '@/constants/SETTING';
import { keyGenerator } from '@/utils';

export default function Layout() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const CurrentComponents = useThemeBasedComponents(
    state => state.CurrentComponents
  );

  return (
    <SafeAreaView
      edges={[]}
      style={[styles.container, currentStyle?.background_style]}
    >
      <Stack
        screenOptions={{
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          headerBackVisible: false,
          headerLeft: () => (
            <>{CurrentComponents && <CurrentComponents.HeaderLeft />}</>
          ),
          headerRight: () => <View style={{ height: 22, width: 22 }}></View>,
          headerStyle: currentStyle?.header_background_style as StyleProp<{
            backgroundColor: string | undefined;
            flexDirection: 'row';
            justifyContent: 'space-between'; // 确保 Header 内部均匀分布
            alignItems: 'center';
          }>,
        }}
      >
        {SETTING_ITEMS.map(config => (
          <Stack.Screen
            key={keyGenerator.next().value as unknown as number}
            name={config.name}
            options={{
              headerShown: config.sub ? false : true,
              headerTitle: () => (
                <>
                  {CurrentComponents && (
                    <CurrentComponents.HeaderCenter title={config.title} />
                  )}
                </>
              ),
            }}
          ></Stack.Screen>
        ))}
        <Stack.Screen
          name="privacy"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="隐私条例" />
                )}
              </>
            ),
          }}
        />
        <Stack.Screen
          name="agreement"
          options={{
            headerTitle: () => (
              <>
                {CurrentComponents && (
                  <CurrentComponents.HeaderCenter title="用户协议" />
                )}
              </>
            ),
          }}
        />
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
