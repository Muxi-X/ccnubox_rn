import { request } from '@/request';

export interface SetStandardRequest {
  limit: number;
  room_id: string;
  room_name: string;
}

/**
 * 设置电费提醒标准
 * @param data - 设置电费提醒请求参数
 */
const setStandard = async (data: SetStandardRequest) => {
  return await request.put('/elecprice/setStandard', data);
};

export default setStandard;
