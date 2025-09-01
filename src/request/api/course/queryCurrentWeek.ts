// 查询当前周
import { request } from '@/request';

export const queryCurrentWeek = async () => {
  return await request.get('/class/day/get');
};

export default queryCurrentWeek;
