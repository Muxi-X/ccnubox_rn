import { FEEDBACK_BASE_URL } from '@/constants/BASE_URLS';
import { request } from '@/request';

export interface GetFeedbackTokenRequest {
  table_identify: string;
}

const getFeedbackToken = async (tableId: GetFeedbackTokenRequest) => {
  return await request.post('/api/v1/auth/table-config/token', tableId, {
    isToken: false,
    baseURL: FEEDBACK_BASE_URL,
  });
};

export default getFeedbackToken;
