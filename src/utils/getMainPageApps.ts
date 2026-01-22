import useVisualScheme from '@/store/visualScheme';

import { HOME_ITEMS } from '@/constants/HOME';

import type { MainPageGridDataType } from '@/types/mainPageGridTypes';

export const getMainPageApplications = (): MainPageGridDataType[] => {
  const { iconStyleSelect } = useVisualScheme.getState();

  return HOME_ITEMS.map(
    item =>
      ({
        ...item,
        imageUrl: iconStyleSelect(item.imageUrl),
      }) as MainPageGridDataType
  );
};
