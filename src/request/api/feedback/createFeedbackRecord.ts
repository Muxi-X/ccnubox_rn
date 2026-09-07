import { feedbackRequest } from '@/request';

import { UserSheetTokenConfig } from './config';

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
  return feedbackRequest.post('/api/v1/sheet/records', params, {
    otherToken: UserSheetTokenConfig,
  });
};

export default createFeedbackRecord;
