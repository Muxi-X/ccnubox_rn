import { request } from '@/request';

const queryCurrentSemester = async () => {
  return await request.get('/semester/getSemester');
};

export default queryCurrentSemester;
