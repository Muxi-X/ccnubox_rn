import { request } from '@/request';

// 成绩查询
export const queryGradeAll = async () => {
  try {
    const response = await request.get(`/grade/getGradeScore`);
    return response.data;
  } catch (error) {
    console.error('queryGradeAll 查询成绩接口出错:', error);
    throw error;
  }
};

export default queryGradeAll;
