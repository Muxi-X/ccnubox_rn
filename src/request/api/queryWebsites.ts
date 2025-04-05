import { request } from '../request';

import { PopularWebsite } from '@/types/shared-types';

interface Response {
  code?: number;
  data: {
    websites: PopularWebsite[];
  };
  msg?: string;
}

const queryWebsites = async () => {
  try {
    const response: Response = await request.get('/website/getWebsites');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default queryWebsites;
