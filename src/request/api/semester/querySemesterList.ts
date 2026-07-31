import { request } from '@/request';

const querySemesterList = async () => {
  return await request.get('/semester/getSemesterList');
};

export default querySemesterList;
