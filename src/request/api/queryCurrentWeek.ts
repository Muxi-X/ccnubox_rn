// 查询当前周
import { request } from '@/request/request';

export const queryCurrentWeek = async () => {
  try {
    return await request.get('/class/day/get');
  } catch (error) {
    console.error('查询当前周接口出错:', error);
    throw error;
  }
};

export default queryCurrentWeek;
