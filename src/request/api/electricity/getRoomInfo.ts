import { request } from '@/request';

/**
 * 获取房间信息
 * @param architecture_id 楼栋ID
 * @param floor 楼层
 */
export default async function getRoomInfo(
  architecture_id: string,
  floor: string
) {
  const response = await request.get('/elecprice/getRoomInfo', {
    query: { architecture_id, floor },
    header: { Authorization: '' },
  });

  return response;
}
