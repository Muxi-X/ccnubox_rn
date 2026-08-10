import { Href } from 'expo-router';

import type { AppIcon } from '@/assets/icons';

import { SinglePageType } from './tabBarTypes';

export interface FeedIconTypes extends Omit<
  SinglePageType,
  'iconName' | 'headerLeft'
> {
  name: string;
  Icon: AppIcon;
  text: string;
  href?: Href;
}
