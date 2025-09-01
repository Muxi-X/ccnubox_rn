import { request } from '@/request';

interface QueryParams {
  refresh?: boolean;
  kcxzmcs: string[];
  terms: string[];
}

// 成绩查询详细
export const queryGradeDetail = async (queryParams: QueryParams) => {
  return await request.post('/grade/getGradeByTerm', { ...queryParams });
};

export default queryGradeDetail;
