import { request } from '@/request';

//修改订阅消息白名单
export const changeFeedAllowList = async (data: any) => {
  return await request.post('/feed/changeFeedAllowList', data);
};

export default changeFeedAllowList;
