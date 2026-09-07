import { feedbackRequest } from '@/request';

const getFeishuToken = async () => {
  return await feedbackRequest.post('/api/v1/auth/tenant/token', undefined, {
    isToken: false,
  });
};

export default getFeishuToken;
