import { request } from '@/request';

//获取订阅消息
export const queryFeedEvents = async () => {
  return await request.get('/feed/getFeedEvents', {
    header: { Authorization: '' },
  });
};

export default queryFeedEvents;
