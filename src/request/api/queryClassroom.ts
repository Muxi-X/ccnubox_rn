import { request } from '@/request';

interface QueryFreeClassroomParams {
  year: string;
  semester: string;
  week: number;
  day: number;
  sections: number[];
  wherePrefix: string;
}

// 查询空闲教室
export const queryFreeClassroom = async (
  queryParams: QueryFreeClassroomParams
) => {
  return await request.get('/classroom/getFreeClassRoom', {
    query: queryParams,
    header: { Authorization: '' },
  });
};

export default queryFreeClassroom;
