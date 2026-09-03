import { feedbackRequest } from '@/request';

import { FAQTokenConfig } from './config';

export interface FeedbackFAQRequest {
  table_identify: string;
  is_resolved: boolean;
  record_id: string;
  resolved_field_name: string;
  unresolved_field_name: string;
  user_id: string;
}

const feedbackFAQ = async (params: FeedbackFAQRequest) => {
  return feedbackRequest.post('/api/v1/sheet/records/faq', params, {
    otherToken: FAQTokenConfig,
  });
};

export default feedbackFAQ;
