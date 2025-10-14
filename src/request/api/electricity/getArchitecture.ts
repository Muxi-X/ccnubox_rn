import { request } from '@/request';

/**
 * 获取楼栋信息
 * @param area_name 区域名称
 */
export default async function getArchitecture(area_name: string) {
  const response = await request.get('/elecprice/getArchitecture', {
    query: { area_name },
    header: { Authorization: '' },
  });

  return response;
}
