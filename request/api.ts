import { request } from '@/request/request';

// 查询电费接口封装函数
export const queryElectricityPrice = async (queryParams: any) => {
  try {
    const response = await request.get('/elecprice/check', {
      query: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('查询电费接口出错:', error);
    throw error;
  }
};

// 设置电费接口封装函数
export const setElectricityPrice = async (setParams: any) => {
  try {
    const response = await request.post('/elecprice/set', setParams);
    return response.data;
  } catch (error) {
    console.error('设置电费接口出错:', error);
    throw error;
  }
};
//成绩查询
export const queryGradeAll = async (queryParams: any) => {
  try {
    const response = await request.get('/grade/grade_all', {
      query: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('查询成绩接口出错:', error);
    throw error;
  }
};

//成绩查询详细
export const queryGradeDetail = async (queryParams: any) => {
  try {
    const response = await request.get('/grade/grade_detail', {
      query: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('查询成绩接口出错:', error);
    throw error;
  }
};

// 查询课表
export const queryCourseTable = async (queryParams: any) => {
  try {
    return await request.get('/class/get', {
      query: queryParams,
      header: { Authorization: '' },
    });
  } catch (error) {
    console.error('查询课表接口出错:', error);
    throw error;
  }
};

// 查询当前周
export const queryCurrentWeek = async () => {
  try {
    return await request.get('/class/day/get');
  } catch (error) {
    console.error('查询当前周接口出错:', error);
    throw error;
  }
};
