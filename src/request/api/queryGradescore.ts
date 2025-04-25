// 查询当前周
import { request } from '@/request/request';

export const queryGradeScore = async () => {
  try {
    return await request.get('/grade/getGradeScore');
  } catch (error) {
    //console.error('查询当前周接口出错:', error);
    throw error;
  }
};

export default queryGradeScore;
