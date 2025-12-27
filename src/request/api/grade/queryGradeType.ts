import { request } from '@/request';

/**
 * 获取课程类别
 */
const queryGradeType = async () => {
  return await request.get(`/grade/getGradeType`);
};

export default queryGradeType;
