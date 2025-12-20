import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://116.62.179.155:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器自动添加token
api.interceptors.request.use(async config => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('获取token失败:', error);
    return config;
  }
});

export default api;
