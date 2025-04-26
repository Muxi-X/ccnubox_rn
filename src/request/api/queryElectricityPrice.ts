import { request } from '../request';

interface QueryParams {
  room_id: string;
}

// 查询电费接口封装函数
const queryElectricityPrice = async (queryParams: QueryParams) => {
  try {
    const response = await request.get('/elecprice/getPrice', {
      query: queryParams,
      header: { Authorization: '' },
    });
    return response.data;
  } catch (error) {
    console.error('查询电费接口出错:', error);
    throw error;
  }
};

export default queryElectricityPrice;
