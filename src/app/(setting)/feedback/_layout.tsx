import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

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
          headerTitle: ({ children }) => (
            <>
              {CurrentComponents && (
                <CurrentComponents.HeaderCenter title={children} />
              )}
            </>
          ),
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
        <Stack.Screen
          name="index"
          options={{
            title: '帮助与反馈',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push('/feedback/history')}
              >
                <Ionicons
                  name="time-outline"
                  size={22}
                  color={(currentStyle?.text_style as TextStyle).color}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: '反馈历史',
          }}
        />
        <Stack.Screen
          name="writefeedback"
          options={{
            title: '我要反馈',
          }}
        />
        <Stack.Screen
          name="detail"
          options={{
            title: '反馈详情',
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
