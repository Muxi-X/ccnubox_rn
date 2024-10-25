import { Tabs } from 'expo-router';

import { tabConfig } from '@/constants/tabBar';
import { SingleTabType } from '@/types/tabBarTypes';
import { keyGenerator } from '@/utils/autoKey';

import TabBar from '../../components/navi/index';
import { Text } from 'react-native';

export default function TabLayout() {
  const render = (configs: SingleTabType[]) =>
    configs.map(config => {
      const { name, title, headerTitle, headerRight, headerLeft } = config;
      return (
        <Tabs.Screen
          name={name}
          key={keyGenerator.next().value as number}
          options={{
            title: title,
            headerTitle: headerTitle ?? (() => <Text>{title}</Text>),
            // eslint-disable-next-line react/jsx-no-undef
            headerRight: headerRight,
            headerLeft: headerLeft,
          }}
        />
      );
    });
  return (
    <Tabs tabBar={props => <TabBar {...props} />}>{render(tabConfig)}</Tabs>
  );
}
