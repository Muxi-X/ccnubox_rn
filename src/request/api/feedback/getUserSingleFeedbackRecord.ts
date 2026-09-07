import { feedbackRequest } from '@/request';

import { UserSheetTokenConfig } from './config';

export interface getSingleFeedbackRecordRequest {
  record_id: string;
  table_identify: string;
}

const getSingleFeedbackRecord = async (
  query: getSingleFeedbackRecordRequest
) => {
  return await feedbackRequest.get('/api/v1/sheet/record', { query } as any, {
    otherToken: UserSheetTokenConfig,
  });
};

export default getSingleFeedbackRecord;
