import { request } from '@/request';

interface QueryParams {
  refresh?: boolean;
  kcxzmcs: string[];
  terms: string[];
}

// 成绩查询详细
export const queryGradeDetail = async (queryParams: QueryParams) => {
  try {
    return await request.post('/grade/getGradeByTerm', { ...queryParams });
  } catch (error) {
    //console.error('查询成绩接口出错:', error);
    throw error;
  }
};

export default queryGradeDetail;
