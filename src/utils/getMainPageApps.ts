import { selectIconStyle } from '@/assets/icons';
import { HOME_ITEMS } from '@/constants/HOME';

import type { MainPageGridDataType } from '@/types/mainPageGridTypes';

export const getMainPageApplications = (): MainPageGridDataType[] => {
  return HOME_ITEMS.map(
    item =>
      ({
        ...item,
        imageUrl: selectIconStyle(item.imageUrl),
      }) as MainPageGridDataType
  );
};
