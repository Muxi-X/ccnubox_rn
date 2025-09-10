import { request } from '@/request';

const deleteCourse = async (
  courseId: string,
  semester: string,
  year: string
) => {
  return await request.post(`/class/delete`, {
    id: courseId,
    semester,
    year,
  });
};

export default deleteCourse;
