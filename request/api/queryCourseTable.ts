import { request } from '../request';

// 查询课表
export const queryCourseTable = async (queryParams: any) => {
  try {
    return await request.get('/class/get', {
      query: queryParams,
      header: { Authorization: '' },
    });
  } catch (error) {
    console.error('查询课表接口出错:', error);
    throw error;
  }
};

export default queryCourseTable;
