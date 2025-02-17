import { request } from '../request';

// 成绩查询
export const queryGradeAll = async (queryParams: any) => {
  try {
    const response = await request.get('/grade/grade_all', {
      query: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('查询成绩接口出错:', error);
    throw error;
  }
};

export default queryGradeAll;
