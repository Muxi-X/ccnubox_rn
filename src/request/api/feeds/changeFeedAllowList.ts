import { request } from '@/request';

import { FeedAllowListData } from './types';

//修改订阅消息白名单
export const changeFeedAllowList = async (data: FeedAllowListData) => {
  return await request.post('/feed/changeFeedAllowList', data);
};

export default changeFeedAllowList;
