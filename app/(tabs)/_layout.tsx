import { Tabs } from 'expo-router';

import { tabConfig } from '@/constants/tabBar';
import { SingleTabType } from '@/types/tabBarTypes';
import { keyGenerator } from '@/utils/autoKey';

import TabBar from '../../components/navi/index';

export default function TabLayout() {
  const render = (configs: SingleTabType[]) =>
    configs.map(config => {
      const { name, title, headerRight, headerLeft } = config;
      return (
        <Tabs.Screen
          name={name}
          key={keyGenerator.next().value as number}
          options={{
            title: title || '',
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
