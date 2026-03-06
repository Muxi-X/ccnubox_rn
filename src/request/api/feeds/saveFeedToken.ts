import { request } from '@/request';

import { FeedTokenData } from './types';

//保存feedtoken
export const saveFeedToken = async (data: FeedTokenData) => {
  return await request.post('/feed/changeFeedAllowList', data);
};

export default saveFeedToken;
