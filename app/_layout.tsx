import { Stack } from 'expo-router';
import '../global.css';
import { useLayoutEffect } from 'react';

import useVisualScheme from '@/store/visualScheme';

export default function RootLayout() {
  const initStyles = useVisualScheme(state => state.initStyles);
  useLayoutEffect(() => {
    initStyles();
  }, []);
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
