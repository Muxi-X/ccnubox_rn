import { request } from '@/request';

import { BASE_URL } from './config';
export interface GetFeedbackTokenRequest {
  table_identify: string;
}

const getFeedbackToken = async (tableId: GetFeedbackTokenRequest) => {
  return await request.post('/api/v1/auth/table-config/token', tableId, {
    isToken: false,
    baseURL: BASE_URL,
  });
};

export default getFeedbackToken;
