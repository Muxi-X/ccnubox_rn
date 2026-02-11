import { request } from '@/request';

import { BASE_URL, UserSheetTokenConfig } from './config';

export interface getSingleFeedbackRecordRequest {
  record_id: string;
  table_identify: string;
}

const getSingleFeedbackRecord = async (
  query: getSingleFeedbackRecordRequest
) => {
  return await request.get('/api/v1/sheet/record', { query } as any, {
    otherToken: UserSheetTokenConfig,
    baseURL: BASE_URL,
  });
};

export default getSingleFeedbackRecord;
