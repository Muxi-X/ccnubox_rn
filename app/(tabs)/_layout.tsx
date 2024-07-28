import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs } from 'expo-router';

import { tabConfig } from '@/constants/tabBar';

import { SingleTabType } from './types';
import TabBar from '../../components/navi/index';
import { keyGenerator } from '../../utils/autoKey';

export default function TabLayout() {
  const render = (configs: SingleTabType[]) =>
    configs.map(config => {
      const { name, title, iconName } = config;
      return (
        <Tabs.Screen
          name={name}
          key={keyGenerator.next().value as number}
          options={{
            title: title || name,
            // tabBarIcon: ({ color }) => (
            //   // @ts-ignore 并未提供 iconName 的 type， 只能用 string 代替
            //   <AntDesign size={28} name={iconName ?? 'home'} color={color} />
            // ),
          }}
        />
      );
    });
  return (
    <Tabs tabBar={props => <TabBar {...props} />}>{render(tabConfig)}</Tabs>
  );
}
