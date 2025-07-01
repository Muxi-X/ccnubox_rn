import { request } from '@/request';

interface QueryParams {
  semester: string;
  year: string;
  refresh: boolean;
}

// 查询课表
const queryCourseTable = async (queryParams: QueryParams) => {
  try {
    return await request.get('/class/get', {
      query: queryParams,
      header: { Authorization: '' },
    });
  } catch (error) {
    console.error('查询课表接口出错:', error);
    // throw error;
  }
};

export default queryCourseTable;
