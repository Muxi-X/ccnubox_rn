import { request } from '@/request';

import { FEEDBACK_BASE_URL } from './constants';
import { UserSheetTokenConfig } from './otherTokenConfig';

type RecordValue = number | string | boolean;

export interface CreateFeedbackRecordRequest {
  table_identify: string;
  content: string;
  student_id: string;
  contact_info?: string;
  images?: string[];
  extra_record?: {
    [key: string]: RecordValue;
  };
}

const createFeedbackRecord = async (params: CreateFeedbackRecordRequest) => {
  return request.post('/api/v1/sheet/records', params, {
    otherToken: UserSheetTokenConfig,
    baseURL: FEEDBACK_BASE_URL,
  });
};

export default createFeedbackRecord;
