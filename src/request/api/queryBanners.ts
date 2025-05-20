import { request } from '@/request';

const queryBanners = async () => {
  return await request.get(`/banner/getBanners`);
};

export default queryBanners;
