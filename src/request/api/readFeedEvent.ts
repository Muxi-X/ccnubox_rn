import { request } from '../request';

//标记已读
export const readFeedEvent = async (feed_id: number) => {
  try {
    const response = await request.post('/feed/readFeedEvent', {
      feed_id,
    });
    return response.data;
  } catch (error) {
    //console.error('删除出错:', error);
    throw error;
  }
};

export default readFeedEvent;
