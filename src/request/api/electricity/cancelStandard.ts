import { request } from '@/request';

export interface CancelStandardRequest {
  room_id: string;
}

/**
 * 取消电费提醒标准
 * @param data - 取消电费提醒请求参数
 */
const cancelStandard = async (data: CancelStandardRequest) => {
  return await request.post('/elecprice/cancelStandard', data);
};

export default cancelStandard;
