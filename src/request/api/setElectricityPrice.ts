import { request } from '../request';

const setElectricityPrice = async (setParams: any) => {
  try {
    const response = await request.post('/elecprice/set', setParams);
    return response.data;
  } catch (error) {
    console.error('设置电费接口出错:', error);
    throw error;
  }
};

export default setElectricityPrice;
