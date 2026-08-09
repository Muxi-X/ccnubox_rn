import { Href } from 'expo-router';
import { ImageSourcePropType } from 'react-native';

import type { IconStyleIcons, SvgIcon } from '@/assets/icons';

import { SinglePageType } from '@/types/tabBarTypes';

export interface MainPageGridDataType extends Omit<
  SinglePageType,
  'iconName' | 'headerLeft'
> {
  imageUrl: IconStyleIcons<ImageSourcePropType | SvgIcon>;
  href?: Href;
  action?: () => void;
  key: string;
  disabledDrag?: boolean;
}
