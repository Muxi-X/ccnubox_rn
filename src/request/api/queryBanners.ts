import { axiosInstance } from '../request';

const queryBanners = async () => {
  try {
    const response = await axiosInstance.get(`/banner/getBanners`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default queryBanners;
