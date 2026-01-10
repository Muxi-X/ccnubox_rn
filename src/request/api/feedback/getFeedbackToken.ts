import { request } from '@/request';

import { FEEDBACK_BASE_URL } from './constants';

export interface GetFeedbackTokenRequest {
  table_identity: string;
}

const getFeedbackToken = async (tableId: GetFeedbackTokenRequest) => {
  return await request.post('/api/v1/auth/table-config/token', tableId, {
    isToken: false,
    baseURL: FEEDBACK_BASE_URL,
  });
};

export default getFeedbackToken;
