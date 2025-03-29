import { request } from '../request';

import { DepartmentInformation } from '@/types/shared-types';

interface Response {
  code?: number;
  data: {
    departments: DepartmentInformation[];
  };
  msg?: string;
}

const queryDepartmentInformation = async () => {
  try {
    const response: Response = await request.get('/department/getDepartments'); // 等待请求完成
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default queryDepartmentInformation;
