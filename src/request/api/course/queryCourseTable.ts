import { request } from '@/request';
import { logger } from '@/utils/logger';

interface QueryParams {
  semester: string;
  year: string;
  refresh: boolean;
}

// 查询课表
const queryCourseTable = async (queryParams: QueryParams) => {
  if (!queryParams.year || !/^[123]$/.test(queryParams.semester)) {
    throw new Error('学期信息尚未加载');
  }

  return request
    .get('/class/get', {
      query: queryParams,
      header: { Authorization: '' },
    })
    .catch(error => {
      logger.error('查询课表接口出错', error);
      throw error;
    });
};

export default queryCourseTable;
