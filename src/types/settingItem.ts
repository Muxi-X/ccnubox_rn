import { Href } from 'expo-router';

import { SinglePageType } from '@/types/tabBarTypes';

export interface SettingItem
  extends Omit<SinglePageType, 'iconName' | 'headerLeft'> {
  id: number;
  icon: string;
  text: string;
  to: Href | (() => void);
  subTitle?: string;
  sub?: Href | (() => void);
}
