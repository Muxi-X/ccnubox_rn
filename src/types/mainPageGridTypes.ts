import { Href } from 'expo-router';
import { ImageSourcePropType } from 'react-native';
import { SvgProps } from 'react-native-svg';

import { SinglePageType } from '@/types/tabBarTypes';

export interface MainPageGridDataType extends Omit<
  SinglePageType,
  'iconName' | 'headerLeft'
> {
  imageUrl: ImageSourcePropType | React.FC<SvgProps>;
  href?: Href;
  action?: () => void;
  key: string;
}
