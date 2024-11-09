import { ImageSourcePropType } from 'react-native';
import { SinglePageType } from '@/types/tabBarTypes';

export interface MainPageGridDataType
  extends Omit<Omit<SinglePageType, 'iconName'>, 'headerLeft'> {
  imageUrl: ImageSourcePropType;
  key: string;
}
