import { request } from '@/request';

interface AddCourseRequest {
  credit?: number;
  day: number;
  dur_class: string;
  name: string;
  semester: string;
  teacher: string;
  weeks: number[];
  where: string;
  year: string;
}

// 添加课程
const addCourse = async (courseData: AddCourseRequest) => {
  return await request.post('/class/add', courseData);
};

export default addCourse;
