import { Href } from 'expo-router';
import { ImageSourcePropType } from 'react-native';

import { SinglePageType } from '@/types/tabBarTypes';

export interface MainPageGridDataType
  extends Omit<Omit<SinglePageType, 'iconName'>, 'headerLeft'> {
  imageUrl: ImageSourcePropType;
  href: Href;
  key: string;
}
