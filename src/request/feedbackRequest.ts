import axios, { AxiosInstance } from 'axios';
import { getItem } from 'expo-secure-store';

import { FEEDBACK_BASE_URL } from '@/constants/BASE_URLS';
import requestBus from '@/store/currentRequests';
import { OtherTokenConfig } from '@/types/axios';

import { createRequestClient } from './createRequestClient';
import { paths as FeedbackPaths } from './schema.feedback';

const feedbackAxiosInstance: AxiosInstance = axios.create({
  baseURL: FEEDBACK_BASE_URL,
  adapter: axios.defaults.adapter,
});

async function getStoredFeedbackToken(
  config?: OtherTokenConfig
): Promise<string> {
  if (!config) {
    throw new Error('反馈接口未配置 otherToken');
  }

  if (config.token) return config.token;

  const token = await getItem(config.name);
  if (token) return token;

  if (config.refresh) {
    return await config.refresh();
  }

  throw new Error(`获取 ${config.name} 失败`);
}

feedbackAxiosInstance.interceptors.request.use(
  async config => {
    requestBus.requestRegister();

    if (config.isToken === false) return config;

    try {
      const token = await getStoredFeedbackToken(config?.otherToken);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token.trim()}`;
      }
    } catch (err) {
      return Promise.reject(err);
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

feedbackAxiosInstance.interceptors.response.use(
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
      originalRequest._retry = true;
      const tokenConfig = originalRequest?.otherToken;
      if (tokenConfig?.refresh) {
        try {
          const newToken = await tokenConfig.refresh();
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return feedbackAxiosInstance(originalRequest);
        } catch (refreshError) {
          tokenConfig.onRefreshError?.(refreshError);
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const feedbackRequest = createRequestClient<FeedbackPaths>(
  feedbackAxiosInstance
);
