import { FEEDBACK_BASE_URL } from '@/constants/BASE_URLS';
import { request } from '@/request';

const getFeishuToken = async () => {
  return await request.post('/api/v1/auth/tenant/token', undefined, {
    isToken: false,
    baseURL: FEEDBACK_BASE_URL,
  });
};

export default getFeishuToken;
