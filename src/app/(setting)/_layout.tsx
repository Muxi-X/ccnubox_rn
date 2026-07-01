import { Stack, useSegments } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomStackHeader from '@/components/CustomStackHeader';
import useVisualScheme from '@/store/visualScheme';

import { SETTING_ITEMS } from '@/constants/SETTING';

const EXTRA_TITLES: Record<string, string> = {
  privacy: '隐私条例',
  agreement: '用户协议',
  feedback: '帮助与反馈',
};

function useCurrentTitle() {
  const segments = useSegments();
  const lastName = segments[segments.length - 1];
  return (
    EXTRA_TITLES[lastName] ??
    SETTING_ITEMS.find(c => c.name === lastName)?.title ??
    ''
  );
}

export default function Layout() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const segments = useSegments();
  const title = useCurrentTitle();

  // feedback 有独立的子布局，避免渲染双重 header
  const isFeedbackSubRoute = segments.includes('feedback');

  return (
    <SafeAreaView
      edges={[]}
      style={[styles.container, currentStyle?.background_style]}
    >
      {!isFeedbackSubRoute && <CustomStackHeader title={title} />}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          animation: 'slide_from_right',
        }}
      >
        {SETTING_ITEMS.map(config => (
          <Stack.Screen
            key={config.name}
            name={config.name}
            options={config.sub ? { headerShown: false } : {}}
          />
        ))}
        <Stack.Screen name="privacy" />
        <Stack.Screen name="agreement" />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
