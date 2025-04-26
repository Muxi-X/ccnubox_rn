import { request } from '../request';

//保存feedtoken
export const saveFeedToken = async (data: any) => {
  try {
    const response = await request.post('/feed/changeFeedAllowList', data);
    return response.data;
  } catch (error) {
    //console.error('获取订阅消息出错:', error);
    throw error;
  }
};

export default saveFeedToken;
