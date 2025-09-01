import { request } from '@/request';

//删除feedtoken
export const clearFeedToken = async (token: string) => {
  return await request.post('/feed/removeFeedToken', { token });
};

export default clearFeedToken;
