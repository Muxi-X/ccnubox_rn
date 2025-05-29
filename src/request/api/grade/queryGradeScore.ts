// 查询当前周
import { request } from '@/request';

export const queryGradeScore = async () => {
  return await request.get('/grade/getGradeScore');
};

export default queryGradeScore;
