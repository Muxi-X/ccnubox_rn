import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';

import TabBar from '@/components/navi';

import useVisualScheme from '@/store/visualScheme';

import { tabConfig } from '@/constants/tabBar';
import { keyGenerator } from '@/utils';

import { SinglePageType } from '@/types/tabBarTypes';

export default function TabLayout() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const render = (configs: SinglePageType[]) =>
    configs.map(config => {
      const { name, title, headerTitle, headerRight, headerLeft } = config;
      return (
        <Tabs.Screen
          name={name}
          key={keyGenerator.next().value as unknown as number}
          options={{
            title: title,
            lazy: false,
            headerTitle:
              headerTitle ??
              (() => (
                <Text style={currentStyle?.header_text_style}>{title}</Text>
              )),
            headerRight: headerRight,
            headerLeft: headerLeft,
            headerTitleAlign: 'center',
            tabBarStyle: currentStyle?.schedule_background_style,
            headerStyle: [
              currentStyle?.schedule_background_style,
              Platform.select({
                ios: {
                  height: 120,
                },
              }),
            ],
          }}
        />
      );
    });
  return (
    <Tabs initialRouteName="schedule" tabBar={props => <TabBar {...props} />}>
      {render(tabConfig)}
    </Tabs>
  );
}
