import { request } from '@/request';

import { FEEDBACK_BASE_URL } from './constants';
import { FAQTokenConfig } from './otherTokenConfig';

export interface FeedbackFAQRequest {
  table_identify: string;
  is_resolved: boolean;
  record_id: string;
  resolved_field_name: string;
  unresolved_field_name: string;
  user_id: string;
}

const feedbackFAQ = async (params: FeedbackFAQRequest) => {
  return request.post('/api/v1/sheet/records/faq', params, {
    otherToken: FAQTokenConfig,
    baseURL: FEEDBACK_BASE_URL,
  });
};

export default feedbackFAQ;
