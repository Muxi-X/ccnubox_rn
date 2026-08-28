import { request } from '@/request';

/**
 * 获取房间电费余额
 * @param room_id 房间设备ID
 */
export default async function getBillingBalance(room_id: string) {
  const response = await request.get('/elecprice/electricityBillinBalance', {
    query: { room_id },
    header: { Authorization: '' },
  });

  return response;
}
