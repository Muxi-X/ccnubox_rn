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

// 获取教室参数列表（wherePrefix 列表，用于动态构建筛选项）
export const getClassroomList = async (): Promise<string[]> => {
  const response = await request.get('/classroom/list', {});
  return response?.data?.class_rooms ?? [];
};

export default queryFreeClassroom;
