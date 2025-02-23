import { request } from '../request';

// 成绩查询详细
export const queryGradeDetail = async (queryParams: any) => {
  try {
    const response = await request.get('/grade/grade_detail', {
      query: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('查询成绩接口出错:', error);
    throw error;
  }
};

export default queryGradeDetail;
