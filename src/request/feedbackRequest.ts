import axios, { AxiosInstance } from 'axios';
import { getItem } from 'expo-secure-store';

import { FEEDBACK_BASE_URL } from '@/constants/BASE_URLS';
import { OtherTokenConfig } from '@/types/axios';

import { createRequestClient } from './createRequestClient';
import { installRequestInterceptors } from './installRequestInterceptors';
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

installRequestInterceptors(feedbackAxiosInstance, {
  getToken: config => getStoredFeedbackToken(config),
  getRefresher: config =>
    config?.refresh ? () => config.refresh() : undefined,
});

export const feedbackRequest = createRequestClient<FeedbackPaths>(
  feedbackAxiosInstance
);
