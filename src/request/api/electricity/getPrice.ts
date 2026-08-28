import { request } from '@/request';

/**
 * 获取电费信息
 * @param room_name 房间名称
 */
export default async function getPrice(room_name: string) {
  const response = await request.get('/elecprice/getPrice', {
    query: { room_name },
    header: { Authorization: '' },
  });

  return response;
}
