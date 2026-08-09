import { feedIcons } from '@/assets/icons';

import type { FeedIconTypes } from '@/types/FeedIconTypes';

export const FeedIconList: FeedIconTypes[] = [
  {
    Icon: feedIcons.grade,
    text: '成绩',
    name: 'grade',
  },
  {
    name: 'muxi',
    Icon: feedIcons.muxi,
    text: '木犀官方',
  },
  {
    name: 'holiday',
    Icon: feedIcons.holiday,
    text: '假期临近',
  },
  {
    name: 'energy',
    Icon: feedIcons.energy,
    text: '电费告急',
  },
  {
    name: 'feedback',
    Icon: feedIcons.feedback,
    text: '反馈',
  },
];

export const FeedIconMap = FeedIconList.reduce<Record<string, FeedIconTypes>>(
  (map, item) => {
    map[item.name] = item;
    return map;
  },
  {}
);
