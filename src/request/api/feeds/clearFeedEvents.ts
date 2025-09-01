import { request } from '@/request';

//清除feed订阅事件
export const clearFeedEvents = async () => {
  return await request.post('/feed/clearFeedEvent', {
    status: 'all',
    feed_id: 0,
  });
};

export default clearFeedEvents;
