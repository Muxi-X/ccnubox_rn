import { request } from '@/request';

/**
 * 获取电费信息
 * @param room_id 房间ID
 */
export default async function getPrice(room_id: string) {
  const response = await request.get('/elecprice/getPrice', {
    query: { room_id },
    header: { Authorization: '' },
  });

  return response;
}
