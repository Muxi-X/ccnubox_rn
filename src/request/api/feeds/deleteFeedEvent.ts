import { request } from '@/request';

// 删除单条 feed 消息
export const deleteFeedEvent = async (feedId: number) => {
  return await request.post('/feed/clearFeedEvent', {
    feed_id: feedId,
    status: 'all',
  });
};

export default deleteFeedEvent;
