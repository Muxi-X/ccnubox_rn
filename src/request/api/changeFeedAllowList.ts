import { request } from '../request';

//修改订阅消息白名单
export const changeFeedAllowList = async (data: any) => {
  try {
    const response = await request.post('/feed/changeFeedAllowList', data);
    return response.data;
  } catch (error) {
    //console.error('获取订阅消息出错:', error);
    throw error;
  }
};

export default changeFeedAllowList;
