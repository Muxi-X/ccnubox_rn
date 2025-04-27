import { request } from '@/request';

interface QueryParams {
  refresh?: boolean;
  xqm: number;
  xnm: number;
}

// 成绩查询详细
export const queryGradeDetail = async (queryParams: QueryParams) => {
  try {
    return await request.get('/grade/getGradeByTerm', {
      query: queryParams,
    });
  } catch (error) {
    //console.error('查询成绩接口出错:', error);
    throw error;
  }
};

export default queryGradeDetail;
