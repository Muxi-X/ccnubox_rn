import { router, Stack, usePathname } from 'expo-router';
import { StyleProp, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Text from '@/components/text';

import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import StarIcon from '@/assets/icons/star.svg';
import { mainPageApplications } from '@/constants/mainPageApplications';
import { keyGenerator } from '@/utils';

// 定义需要统一 header 的子页面配置
// const pagesWithHeader = [
//   { name: 'electricityBillinBalance', title: '电费查询' },
//   { name: 'webview', title: '常用网站' },
// ];

export default function Layout() {
  const { currentStyle } = useVisualScheme(({ currentStyle }) => ({
    currentStyle,
  }));
  const pathname = usePathname();
  const CurrentComponents = useThemeBasedComponents(
    state => state.CurrentComponents
  );
  // 通用的 header 配置
  const createHeaderOptions = (title?: string) => ({
    headerTitle: () => (
      <>
        {CurrentComponents && (
          <CurrentComponents.HeaderCenter title={title || ''} />
        )}
      </>
    ),
    headerLeft: () => (
      <>{CurrentComponents && <CurrentComponents.HeaderLeft />}</>
    ),
    headerRight: () => {
      if (pathname.endsWith('classroom')) {
        return (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: '/(mainPage)/classroomStar',
              });
            }}
            // style={styles.starButton}
          >
            <StarIcon width={24} height={24} color="#FFD700" />
            <Text style={[{ fontSize: 6 }, currentStyle?.header_text_style]}>
              我的收藏
            </Text>
          </TouchableOpacity>
        );
      }
    },
    headerStyle: currentStyle?.header_background_style as StyleProp<{
      backgroundColor: string | undefined;
      flexDirection: 'row';
      justifyContent: 'space-between';
      alignItems: 'center';
    }>,
  });

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
          headerShadowVisible: false,
        }}
      >
        {/* 主页面 - 来自 mainPageApplications */}
        {mainPageApplications
          .filter(app => app.href)
          .map(config => (
            <Stack.Screen
              key={keyGenerator.next().value as unknown as number}
              name={config.name}
              options={createHeaderOptions(config.title)}
            ></Stack.Screen>
          ))}
        {/* 特殊页面 - 不需要 header */}
        <Stack.Screen
          name="scoreCalculation"
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen
          name="electricityBillinBalance"
          key={keyGenerator.next().value as unknown as number}
          options={createHeaderOptions('电费查询')}
        ></Stack.Screen>
        <Stack.Screen
          name="classroomStar"
          key={keyGenerator.next().value as unknown as number}
          options={createHeaderOptions('我的收藏')}
        ></Stack.Screen>
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
