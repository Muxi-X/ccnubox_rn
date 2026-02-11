import { request } from '@/request';
import { serializeQueryParams } from '@/utils/serializeQueryParams';

import { BASE_URL, UserSheetTokenConfig } from './config';
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
      baseURL: BASE_URL,
    }
  );
};

export default getUserFeedbackSheet;
