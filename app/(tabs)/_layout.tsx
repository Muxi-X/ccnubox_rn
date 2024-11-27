import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import useVisualScheme from '@/store/visualScheme';

import { tabConfig } from '@/constants/tabBar';
import { keyGenerator } from '@/utils/autoKey';

import TabBar from '../../components/navi/index';

import { SinglePageType } from '@/types/tabBarTypes';

export default function TabLayout() {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const render = (configs: SinglePageType[]) =>
    configs.map(config => {
      const { name, title, headerTitle, headerRight, headerLeft } = config;
      return (
        <Tabs.Screen
          name={name}
          key={keyGenerator.next().value as number}
          options={name === 'schedule' ? {
            title: title,
            headerTitle:
              headerTitle ??
              (() => (
                <Text style={currentStyle?.header_text_style}>{title}</Text>
              )),
            // eslint-disable-next-line react/jsx-no-undef
            headerRight: headerRight,
            headerLeft: headerLeft,
            tabBarStyle: currentStyle?.schedule_background_style,
            headerStyle: currentStyle?.schedule_background_style,
          } : {
            title: title,
            headerTitle:
              headerTitle ??
              (() => (
                <Text style={currentStyle?.header_text_style}>{title}</Text>
              )),
            // eslint-disable-next-line react/jsx-no-undef
            headerRight: headerRight,
            headerLeft: headerLeft,
            tabBarStyle: currentStyle?.navbar_background_style,
            headerStyle: currentStyle?.header_background_style,
          }
        }
        />
      );
    });
  return (
    <Tabs initialRouteName="schedule" tabBar={props => <TabBar {...props} />}>
      {render(tabConfig)}
    </Tabs>
  );
}
