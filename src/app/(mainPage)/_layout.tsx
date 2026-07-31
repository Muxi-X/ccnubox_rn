import { Stack, useSegments } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomStackHeader from '@/components/CustomStackHeader';
import { useHeaderRightStore } from '@/store/headerRight';
import useVisualScheme from '@/store/visualScheme';
import { getMainPageApplications } from '@/utils/getMainPageApps';

const TITLE_MAP: Record<string, string> = {
  electricityBillinBalance: '电费查询',
  webview: '常用网站',
  scoreCalculation: '计算学分绩',
  classroom: '空闲教室',
  classroomStar: '我的收藏',
};

function useCurrentTitle() {
  const segments = useSegments();
  const lastName = segments[segments.length - 1];
  return (
    TITLE_MAP[lastName] ??
    getMainPageApplications().find(a => a.name === lastName)?.title ??
    ''
  );
}

export default function Layout() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const title = useCurrentTitle();
  const headerRight = useHeaderRightStore(state => state.content);

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, currentStyle?.background_style]}
    >
      <CustomStackHeader title={title} headerRight={headerRight} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle:
            useVisualScheme.getState().currentStyle?.background_style,
          animation: 'slide_from_right',
        }}
      >
        {getMainPageApplications()
          .filter(app => app.href)
          .map(config => (
            <Stack.Screen key={config.name} name={config.name} />
          ))}
        <Stack.Screen name="scoreCalculation" />
        <Stack.Screen name="electricityBillinBalance" />
        <Stack.Screen name="webview" />
        <Stack.Screen name="classroomStar" />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
