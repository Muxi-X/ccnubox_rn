import { Stack, useSegments } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import CustomStackHeader from '@/components/CustomStackHeader';
import useVisualScheme from '@/store/visualScheme';

import { SCHEDULE_PAGES } from '@/constants/SCHEDULE';

function useCurrentTitle() {
  const segments = useSegments();
  const lastName = segments[segments.length - 1];
  return SCHEDULE_PAGES.find(c => c.name === lastName)?.title ?? '';
}

export default function Layout() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const title = useCurrentTitle();

  return (
    <View style={[styles.container, currentStyle?.background_style]}>
      <CustomStackHeader title={title} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          animation: 'slide_from_right',
        }}
      >
        {SCHEDULE_PAGES.map(config => (
          <Stack.Screen key={config.name} name={config.name} />
        ))}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
