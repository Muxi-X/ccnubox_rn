import { request } from '@/request';

const queryWebsites = async () => {
  return await request.get(`/website/getWebsites`);
};

export default queryWebsites;
