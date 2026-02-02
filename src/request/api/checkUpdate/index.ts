import { request } from '@/request';

const getUpdateVersion = async () => {
  return await request.get(`/version/getVersion`);
};

export default getUpdateVersion;
