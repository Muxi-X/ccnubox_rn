import { HOME_ITEMS } from '@/constants/HOME';

import type { MainPageGridDataType } from '@/types/mainPageGridTypes';

export const getMainPageApplications = (): MainPageGridDataType[] => {
  return HOME_ITEMS.map(
    item =>
      ({
        ...item,
      }) as MainPageGridDataType
  );
};
