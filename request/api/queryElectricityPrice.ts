import { request } from '../request';

interface QueryParams {
  area: string;
  building: string;
  room: string;
}

// 查询电费接口封装函数
const queryElectricityPrice = async (queryParams: QueryParams) => {
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

export default queryElectricityPrice;
