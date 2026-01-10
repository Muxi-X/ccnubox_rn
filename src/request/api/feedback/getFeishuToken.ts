import { request } from '@/request';

import { FEEDBACK_BASE_URL } from './constants';

const getFeishuToken = async () => {
  return await request.post('/api/v1/auth/tenant/token', undefined, {
    isToken: false,
    baseURL: FEEDBACK_BASE_URL,
  });
};

export default getFeishuToken;
