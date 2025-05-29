import { request } from '@/request';

//标记已读
export const readFeedEvent = async (feed_id: number) => {
  return await request.post('/feed/readFeedEvent', {
    feed_id,
  });
};

export default readFeedEvent;
