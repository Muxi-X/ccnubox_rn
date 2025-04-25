import { request } from '../request';

//删除feedtoken
export const clearFeedToken = async (token: string) => {
  try {
    const response = await request.post('/feed/removeFeedToken', { token });
    return response.data;
  } catch (error) {
    //console.error('删除订阅token出错:', error);
    throw error;
  }
};

export default clearFeedToken;
