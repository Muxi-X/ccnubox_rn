import axiosInstance from '@/request/interceptor';

// 查询电费接口封装函数
export const queryElectricityPrice = async (queryParams: any) => {
  try {
    const queryString = Object.keys(queryParams)
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');
    const response = await axiosInstance.get(`/elecprice/check?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('查询电费接口出错:', error);
    throw error;
  }
};

// 设置电费接口封装函数
export const setElectricityPrice = async (setParams: any) => {
  try {
    const response = await axiosInstance.post('/elecprice/set', setParams);
    return response.data;
  } catch (error) {
    console.error('设置电费接口出错:', error);
    throw error;
  }
};
//成绩查询
export const queryGradeAll = async (queryParams: any) => {
  try {
    const queryString = Object.keys(queryParams)
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');
    const response = await axiosInstance.get(`/grade/grade_all?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('查询成绩接口出错:', error);
    throw error;
  }
};

//成绩查询详细
export const queryGradeDetail = async (queryParams: any) => {
  try {
    const queryString = Object.keys(queryParams)
      .map((key) => `${key}=${queryParams[key]}`)
      .join('&');
    const response = await axiosInstance.get(`/grade/grade_detail?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('查询成绩接口出错:', error);
    throw error;
  }
};
