import { request } from '@/request';

// 保存 feed token
export const saveFeedToken = async (token: string) => {
  return await request.post('/feed/saveFeedToken', { token });
};

export default saveFeedToken;
