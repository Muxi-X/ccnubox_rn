import { request } from '@/request';

interface DeleteCourseNoteRequest {
  classId: string;
  semester: string;
  year: string;
}

// 删除课程备注
const deleteCourseNote = async (courseNote: DeleteCourseNoteRequest) => {
  return await request.post('/class/note/delete', courseNote);
};

export default deleteCourseNote;
