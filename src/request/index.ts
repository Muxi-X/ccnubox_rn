import axios, { AxiosInstance } from 'axios';
import { router } from 'expo-router';
import { getItem, setItem } from 'expo-secure-store';

import { BASE_URL } from '@/constants/BASE_URLS';
import requestBus from '@/store/currentRequests';
import { OtherTokenConfig } from '@/types/axios';

import { createRequestClient } from './createRequestClient';
import { paths } from './schema';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  adapter: axios.defaults.adapter,
});

async function getStoredToken(config?: OtherTokenConfig): Promise<string> {
  try {
    if (!config) {
      const shortToken = await getItem('shortToken');
      if (shortToken) return shortToken;

      // 如果短 token 不存在，尝试刷新
      return await refreshToken();
    }

    if (config.token) return config.token;

    const token = await getItem(`${config.name}`);

    if (token) return token;

    // config.refresh是必选，如果没选的话走refreshToken，那里有错误处理
    if (config.refresh) {
      return await config.refresh();
    }

    return await refreshToken(config);
  } catch {
    //console.error('获取 token 失败:', error);
    throw new Error('token不存在');
  }
}

let refreshingPromise: Promise<string> | null = null;

async function refreshToken(config?: OtherTokenConfig): Promise<string> {
  if (!config) {
    if (refreshingPromise) {
      return refreshingPromise;
    }

    refreshingPromise = (async () => {
      try {
        const longToken = await getItem('longToken');
        if (!longToken) {
          throw new Error('长 token 不存在，跳转登录');
        }

        // 刷新短 token
        const response = await axios.get(`${BASE_URL}/users/refresh_token`, {
          headers: { Authorization: `Bearer ${longToken}` },
        });

        if (response.status === 200 || response.status === 201) {
          const newShortToken = response.headers['x-jwt-token'];
          setItem('shortToken', newShortToken);
          return newShortToken;
        }

        throw new Error('刷新短 token 失败');
      } finally {
        refreshingPromise = null;
      }
    })();

    return refreshingPromise;
  }

  if (config.refresh) {
    return await config.refresh();
  }

  throw new Error(`${config.name} 未配置 refresh`);
}

axiosInstance.interceptors.request.use(
  async config => {
    requestBus.requestRegister();

    if (config.isToken === false) return config;

    try {
      const token = await getStoredToken(config?.otherToken);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token.trim()}`;
      }
    } catch {
      throw Error('token不存在');
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => {
    requestBus.requestComplete();

    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    return Promise.reject(new Error(`Error status code: ${response.status}`));
  },
  async error => {
    requestBus.requestComplete();
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // 防止无限循环

      const tokenConfig = originalRequest?.otherToken;
      try {
        const newToken = await refreshToken(tokenConfig);

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest); // 重新发送请求
      } catch (refreshError) {
        if (tokenConfig) {
          tokenConfig.onRefreshError?.(refreshError);
          return Promise.reject(refreshError);
        }

        router.replace('/auth/login');
        return Promise.reject(refreshError);
      }
    }

    //   console.error('Error response:', error);
    return Promise.reject(error);
  }
);

const request = createRequestClient<paths>(axiosInstance);

export { request };
export { feedbackRequest } from './feedbackRequest';
export * from './createRequestClient';
