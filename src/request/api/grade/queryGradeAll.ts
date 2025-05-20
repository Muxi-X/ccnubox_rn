import { request } from '@/request';

// 成绩查询
export const queryGradeAll = async () => {
  return await request.get(`/grade/getGradeScore`);
};

export default queryGradeAll;
