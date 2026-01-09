import { request } from '@/request';

// 移除 feed token
export const removeFeedToken = async (token: string) => {
  return await request.post('/feed/removeFeedToken', { token });
};

export default removeFeedToken;
