import { axiosInstance } from '../request';

const queryWebsites = async () => {
  try {
    const response = await axiosInstance.get(`/website/getWebsites`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default queryWebsites;
