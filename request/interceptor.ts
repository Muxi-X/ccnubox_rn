import axios from 'axios';
import { router } from 'expo-router';
import { getItem } from 'expo-secure-store';

import requestBus from '@/store/currentRequests';
import Toast from '@/components/toast';

const axiosInstance = axios.create({
  baseURL: 'http://121.43.151.190:8080',
});

function getStoredToken() {
  try {
    const token = getItem('token');
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
    try {
      const token = getStoredToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('token 缺失:', error);
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
        Toast.show({ text: '无权限' });
        break;
      default:
        Toast.show({ text: '服务器错误' });
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
