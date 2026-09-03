import { feedbackRequest } from '@/request';
import { serializeQueryParams } from '@/utils/serializeQueryParams';

import { UserSheetTokenConfig } from './config';
export interface GetUserFeedbackSheetRequest {
  page_token?: string;
  record_names: string[];
  key_field: string;
  key_value: string;
  table_identify: string;
}

const getUserFeedbackSheet = async (query: GetUserFeedbackSheetRequest) => {
  const queryString = serializeQueryParams(query as any);

  return feedbackRequest.get(
    '/api/v1/sheet/records',
    {
      query: queryString,
    } as any,
    {
      otherToken: UserSheetTokenConfig,
    }
  );
};

export default getUserFeedbackSheet;
