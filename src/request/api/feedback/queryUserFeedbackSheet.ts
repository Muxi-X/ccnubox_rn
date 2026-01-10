import { request } from '@/request';
import { serializeQueryParams } from '@/utils/serializeQueryParams';

import { FEEDBACK_BASE_URL } from './constants';
import { UserSheetTokenConfig } from './otherTokenConfig';

export interface GetUserFeedbackSheetRequest {
  page_token?: string;
  record_names: string[];
  key_field: string;
  key_value: string;
  table_identify: string;
}

const getUserFeedbackSheet = async (query: GetUserFeedbackSheetRequest) => {
  const queryString = serializeQueryParams(query as any);

  return request.get(
    '/api/v1/sheet/records',
    {
      query: queryString,
    } as any,
    {
      otherToken: UserSheetTokenConfig,
      baseURL: FEEDBACK_BASE_URL,
    }
  );
};

export default getUserFeedbackSheet;
