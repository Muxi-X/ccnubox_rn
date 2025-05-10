import { request } from '@/request';

const queryBanners = async () => {
  try {
    return await request.get(`/banner/getBanners`);
  } catch (error) {
    throw error;
  }
};

export default queryBanners;
