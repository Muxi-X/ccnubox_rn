import { feedIcons, selectIconStyle } from '@/assets/icons';

import type { FeedIconTypes } from '@/types/FeedIconTypes';

export const getFeedIconList = (): FeedIconTypes[] => [
  {
    imageUrl: selectIconStyle(feedIcons.grade),
    text: '成绩',
    name: 'grade',
  },
  {
    name: 'muxi',
    imageUrl: selectIconStyle(feedIcons.muxi),
    text: '木犀官方',
  },
  {
    name: 'holiday',
    imageUrl: selectIconStyle(feedIcons.holiday),
    text: '假期临近',
  },
  {
    name: 'energy',
    imageUrl: selectIconStyle(feedIcons.energy),
    text: '电费告急',
  },
  {
    name: 'feedback',
    imageUrl: selectIconStyle(feedIcons.feedback),
    text: '反馈',
  },
];
