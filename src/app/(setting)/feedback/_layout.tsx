import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useSegments } from 'expo-router';
import { StyleSheet, TextStyle, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomStackHeader from '@/components/CustomStackHeader';
import useVisualScheme from '@/store/visualScheme';

const FEEDBACK_TITLES: Record<string, string> = {
  index: '帮助与反馈',
  feedback: '帮助与反馈',
  history: '反馈历史',
  writefeedback: '我要反馈',
  detail: '反馈详情',
};

function useCurrentTitle() {
  const segments = useSegments();
  const lastName = segments[segments.length - 1];
  return FEEDBACK_TITLES[lastName] ?? '';
}

export default function FeedbacksLayout() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const title = useCurrentTitle();

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <CustomStackHeader
        title={title}
        headerRight={
          title === '帮助与反馈' ? (
            <TouchableOpacity
              onPress={() => router.push('/feedback/history')}
            >
              <Ionicons
                name="time-outline"
                size={22}
                color={
                  (currentStyle?.text_style as TextStyle)?.color ?? '#1D1D23'
                }
              />
            </TouchableOpacity>
          ) : undefined
        }
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="history" />
        <Stack.Screen name="writefeedback" />
        <Stack.Screen name="detail" />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
