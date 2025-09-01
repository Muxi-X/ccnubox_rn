import { request } from '@/request';

//保存feedtoken
export const saveFeedToken = async (data: any) => {
  return await request.post('/feed/changeFeedAllowList', data);
};

export default saveFeedToken;
