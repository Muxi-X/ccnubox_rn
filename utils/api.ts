import { axiosInstance } from '@/request/request';

// 成绩查询
export const queryGradeAll = async (queryParams: any) => {
  try {
    // const queryString = Object.keys(queryParams)
    //   .map(key => `${key}=${queryParams[key]}`)
    //   .join('&');
    const response = await axiosInstance.get(`/grade/getGradeScore`);
    return response.data;
  } catch (error) {
    console.error('queryGradeAll 查询成绩接口出错:', error);
    throw error;
  }
};
