import { request } from '@/request';

interface AddCourseNoteRequest {
  classId: string;
  note: string;
  semester: string;
  year: string;
}

// 添加课程备注
const addCourseNote = async (courseNote: AddCourseNoteRequest) => {
  return await request.post('/class/note/insert', courseNote);
};

export default addCourseNote;
