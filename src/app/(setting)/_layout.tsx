import { Stack } from 'expo-router';
import { StyleProp, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import { SettingItems } from '@/constants/settingItem';
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
      edges={['bottom']}
      style={[styles.container, currentStyle?.background_style]}
    >
      <Stack
        screenOptions={{
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          headerBackVisible: false,
        }}
      >
        {SettingItems.map(config => (
          <Stack.Screen
            key={keyGenerator.next().value as unknown as number}
            name={config.name}
            options={{
              headerTitle: () => (
                <>
                  {CurrentComponents && (
                    <CurrentComponents.HeaderCenter title={config.title} />
                  )}
                </>
              ),
              headerLeft: () => (
                <>{CurrentComponents && <CurrentComponents.HeaderLeft />}</>
              ),
              headerStyle: currentStyle?.header_background_style as StyleProp<{
                backgroundColor: string | undefined;
                flexDirection: 'row';
                justifyContent: 'space-between'; // 确保 Header 内部均匀分布
                alignItems: 'center';
              }>,
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
            headerStyle: currentStyle?.header_background_style as StyleProp<{
              backgroundColor: string | undefined;
              flexDirection: 'row';
              justifyContent: 'space-between'; // 确保 Header 内部均匀分布
              alignItems: 'center';
            }>,
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
            headerStyle: currentStyle?.header_background_style as StyleProp<{
              backgroundColor: string | undefined;
              flexDirection: 'row';
              justifyContent: 'space-between'; // 确保 Header 内部均匀分布
              alignItems: 'center';
            }>,
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
