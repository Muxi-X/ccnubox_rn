import { request } from '../request';

//清除feed订阅事件
export const clearFeedEvents = async (feed_id: number) => {
  try {
    const response = await request.post('/feed/clearFeedEvent', { feed_id });
    console.log('clear', response);
    return response.data;
  } catch (error) {
    console.error('清除订阅事件出错:', error);
    throw error;
  }
};

export default clearFeedEvents;
