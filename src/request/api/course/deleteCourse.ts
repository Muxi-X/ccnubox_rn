import { request } from '@/request';

const deleteCourse = async (id: string, semester: string, year: string) => {
  return await request.post(`/class/delete`, {
    id,
    semester,
    year,
  });
};

export default deleteCourse;
