import axios from 'axios';
import { router } from 'expo-router';
import { getItem } from 'expo-secure-store';

import requestBus from '@/store/currentRequests';

const axiosInstance = axios.create({
  baseURL: '',
});

async function getStoredToken() {
  try {
    const token = await getItem('token'); // 添加 await，因为 getItem 是异步的
    if (token) return token;
  } catch (error) {
    console.error('获取 token 失败:', error);
  }
  throw new Error('token不存在');
}

axiosInstance.interceptors.request.use(
  async config => {
    // 注册请求
    requestBus.requestRegister();

    // 检查是否需要添加 token
    if (config.isToken !== false) {
      // 默认添加 token，除非明确指定 isToken: false
      try {
        const token = await getStoredToken(); // 确保异步调用的正确性
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('token 缺失:', error);
      }
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => {
    switch (response.status) {
      case 200:
        return response;
      case 401:
        console.error('token过期');
        router.navigate('/auth/login');
        break;
      case 403:
        console.error('无权限');
        break;
      default:
        console.error('服务器错误');
    }
    // 标记请求已完成
    requestBus.requestComplete();
    if (response.status === 200) {
      return response;
    } else {
      console.error('Error status code:', response.status);
      return Promise.reject(new Error('Error status code: ' + response.status));
    }
  },
  error => {
    console.error('Error response:', error);
    // 标记请求已完成
    requestBus.requestComplete();
    return Promise.reject(error);
  }
);

export default axiosInstance;
