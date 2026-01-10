import { request } from '@/request';
import { serializeQueryParams } from '@/utils/serializeQueryParams';

import { FEEDBACK_BASE_URL } from './constants';
import { UserSheetTokenConfig } from './otherTokenConfig';

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
      baseURL: FEEDBACK_BASE_URL,
    }
  );
};

export default getFeedbackImg;
