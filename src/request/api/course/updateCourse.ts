import { request } from '@/request';

interface UpdateCourseRequest {
  classId: string;
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

// 更新课程
const updateCourse = async (courseData: UpdateCourseRequest) => {
  return await request.put('/class/update', courseData);
};

export default updateCourse;
