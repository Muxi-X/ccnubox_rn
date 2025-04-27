import { request } from '@/request';

//获取订阅消息
export const queryFeedEvents = async () => {
  try {
    const response = await request.get('/feed/getFeedEvents', {
      header: { Authorization: '' },
    });
    // console.log('getevent', response);
    return response.data?.feed_events;
  } catch (error) {
    console.error('获取订阅消息出错:', error);
    throw error;
  }
};

export default queryFeedEvents;
