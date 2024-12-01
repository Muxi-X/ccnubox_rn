import { Href } from 'expo-router';

import { SinglePageType } from '@/types/tabBarTypes';

export interface SettingItem
  extends Omit<Omit<SinglePageType, 'iconName'>, 'headerLeft'> {
  id: number;
  icon: { uri: string };
  text: string;
  url: Href<string>;
}
