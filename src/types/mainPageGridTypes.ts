import { Href } from 'expo-router';

import type { AppIcon } from '@/assets/icons';
import { SinglePageType } from '@/types/tabBarTypes';

export interface MainPageGridDataType extends Omit<
  SinglePageType,
  'iconName' | 'headerLeft'
> {
  Icon: AppIcon;
  href?: Href;
  action?: () => void;
  key: string;
  disabledDrag?: boolean;
}
