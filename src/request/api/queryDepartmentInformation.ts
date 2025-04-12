import { axiosInstance } from '../request';

const queryDepartmentInformation = async () => {
  try {
    const response = await axiosInstance.get(`/department/getDepartments`); // 等待请求完成
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default queryDepartmentInformation;
