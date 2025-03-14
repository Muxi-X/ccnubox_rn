import { Href } from 'expo-router';
import { ImageSourcePropType } from 'react-native';

import { SinglePageType } from './tabBarTypes';

export interface FeedIconTypes
  extends Omit<SinglePageType, 'iconName' | 'headerLeft'> {
  name: string;
  imageUrl: ImageSourcePropType;
  text: string;
  href?: Href;
}
