import { request } from '@/request';
import { serializeQueryParams } from '@/utils/serializeQueryParams';

import { BASE_URL, FAQTokenConfig } from './config';

export interface GetFAQRequest {
  record_names: string[];
  table_identify?: string;
  student_id: string;
}

const getFAQ = async (query: GetFAQRequest) => {
  const queryString = serializeQueryParams(query as any);

  return request.get(
    '/api/v1/sheet/records/faq',
    { query: queryString } as any,
    {
      otherToken: FAQTokenConfig,
      baseURL: BASE_URL,
    }
  );
};

export default getFAQ;
