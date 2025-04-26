import { request } from '../request';

const queryWebsites = async () => {
  try {
    return await request.get(`/website/getWebsites`);
  } catch (error) {
    throw error;
  }
};

export default queryWebsites;
