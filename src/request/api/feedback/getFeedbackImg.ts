import { feedbackRequest } from '@/request';
import { serializeQueryParams } from '@/utils/serializeQueryParams';

import { UserSheetTokenConfig } from './config';

export interface GetFeedbackImgRequest {
  file_tokens: string[];
}

const getFeedbackImg = async (query: GetFeedbackImgRequest) => {
  const queryString = serializeQueryParams(query as any);

  return feedbackRequest.get(
    '/api/v1/sheet/photos/url',
    { query: queryString } as any,
    {
      otherToken: UserSheetTokenConfig,
    }
  );
};

export default getFeedbackImg;
