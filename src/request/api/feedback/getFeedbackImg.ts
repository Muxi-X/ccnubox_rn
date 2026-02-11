import { request } from '@/request';
import { serializeQueryParams } from '@/utils/serializeQueryParams';

import { BASE_URL, UserSheetTokenConfig } from './config';

export interface GetFeedbackImgRequest {
  file_tokens: string[];
}

const getFeedbackImg = async (query: GetFeedbackImgRequest) => {
  const queryString = serializeQueryParams(query as any);

  return request.get(
    '/api/v1/sheet/photos/url',
    { query: queryString } as any,
    {
      otherToken: UserSheetTokenConfig,
      baseURL: BASE_URL,
    }
  );
};

export default getFeedbackImg;
