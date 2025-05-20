import { request } from '@/request';

//获取订阅消息白名单
export const queryFeedAllowList = async () => {
  return await request.get('/feed/getFeedAllowList', {
    header: { Authorization: '' },
  });
};

export default queryFeedAllowList;
