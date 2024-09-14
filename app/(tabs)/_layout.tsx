import { Tabs } from 'expo-router';

import { tabConfig } from '@/constants/tabBar';
import { SingleTabType } from '@/types/tabBarTypes';
import { keyGenerator } from '@/utils/autoKey';

import TabBar from '../../components/navi/index';

export default function TabLayout() {
  const render = (configs: SingleTabType[]) =>
    configs.map(config => {
      const { name, title } = config;
      return (
        <Tabs.Screen
          name={name}
          key={keyGenerator.next().value as number}
          options={{
            title: title || name,
          }}
        />
      );
    });
  return (
    <Tabs tabBar={props => <TabBar {...props} />}>{render(tabConfig)}</Tabs>
  );
}
