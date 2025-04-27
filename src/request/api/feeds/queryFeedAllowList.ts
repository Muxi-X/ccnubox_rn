import { request } from '@/request';

//获取订阅消息白名单
export const queryFeedAllowList = async () => {
  try {
    const response = await request.get('/feed/getFeedAllowList', {
      header: { Authorization: '' },
    });
    return response.data;
  } catch (error) {
    console.error('获取订阅消息出错:', error);
    throw error;
  }
};

export default queryFeedAllowList;
