import { Href } from 'expo-router';

import { SinglePageType } from '@/types/tabBarTypes';

export interface SettingItem
  extends Omit<SinglePageType, 'iconName' | 'headerLeft'> {
  id: number;
  icon: { uri: string };
  text: string;
  to: Href | (() => void);
}
