import { request } from '@/request';

import { BASE_URL } from './config';

const getFeishuToken = async () => {
  return await request.post('/api/v1/auth/tenant/token', undefined, {
    isToken: false,
    baseURL: BASE_URL,
  });
};

export default getFeishuToken;
