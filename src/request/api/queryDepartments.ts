import { request } from '@/request';

const queryDepartments = async () => {
  return await request.get(`/department/getDepartments`);
};

export default queryDepartments;
