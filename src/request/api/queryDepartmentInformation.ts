import { request } from '../request';

const queryDepartmentInformation = async () => {
  try {
    return await request.get(`/department/getDepartments`); // 等待请求完成
  } catch (error) {
    throw error;
  }
};

export default queryDepartmentInformation;
