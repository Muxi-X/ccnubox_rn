import { request } from '@/request';

export interface StandardResp {
  limit: number;
  room_name: string;
}

export interface GetStandardListResponse {
  standard_list: StandardResp[];
}

/**
 * 获取电费提醒标准
 * @returns Promise<GetStandardListResponse>
 */
const getStandardList = async () => {
  const response = await request.get('/elecprice/getStandardList', {
    header: { Authorization: '' },
  });
  return response;
};

export default getStandardList;
