import { feedbackRequest } from '@/request';

export interface GetFeedbackTokenRequest {
  table_identify: string;
}

const getFeedbackToken = async (tableId: GetFeedbackTokenRequest) => {
  return await feedbackRequest.post(
    '/api/v1/auth/table-config/token',
    tableId,
    {
      isToken: false,
    }
  );
};

export default getFeedbackToken;
