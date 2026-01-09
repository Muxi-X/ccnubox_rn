import { request } from '@/request';

// 清除所有 feed 订阅事件
export const clearFeedEvents = async () => {
  return await request.post('/feed/clearFeedEvent', {
    status: 'all',
  });
};

export default clearFeedEvents;
