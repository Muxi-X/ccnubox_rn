import axiosInstance from '@/request/interceptor';

// 查询电费接口封装函数
export const queryElectricityPrice = async (queryParams: any) => {
  try {
    const response = await axiosInstance.post('/elecprice/check', queryParams);
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
