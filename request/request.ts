import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { getItem } from 'expo-secure-store';

import Toast from '@/components/toast';

import requestBus from '@/store/currentRequests';

import { paths } from './schema';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  adapter: axios.defaults.adapter,
});

async function getStoredToken(): Promise<string> {
  try {
    const token = getItem('shortToken');
    if (token) return token;
  } catch (error) {
    console.error('获取 token 失败:', error);
  }
  throw new Error('token不存在');
}

axiosInstance.interceptors.request.use(
  async config => {
    requestBus.requestRegister();

    if (config.isToken !== false) {
      try {
        const token = await getStoredToken();
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
        router.replace('/auth/login');
        break;
      case 403:
        Toast.show({ text: '无权限' });
        break;
      default:
        Toast.show({ text: '服务器错误' });
    }
    requestBus.requestComplete();
    if (response.status === 200) {
      return response;
    } else {
      return Promise.reject(new Error(`Error status code: ${response.status}`));
    }
  },
  error => {
    console.error('Error response:', error);
    requestBus.requestComplete();
    return Promise.reject(error);
  }
);

type Path = keyof paths;
type Method = keyof paths[Path];

type RequestParams<P extends Path, M extends Method> = paths[P][M] extends {
  parameters: infer Params;
}
  ? Params extends object
    ? Params
    : never
  : never;

type RequestBody<P extends Path, M extends Method> = paths[P][M] extends {
  requestBody: { content: { 'application/json': infer Body } };
}
  ? Body
  : never;

type ResponseData<P extends Path, M extends Method> = paths[P][M] extends {
  responses: { 200: { content: { 'application/json': infer Data } } };
}
  ? Data
  : never;

function resolvePathWithParams<P extends Path>(
  path: P,
  params?: NonNullable<RequestParams<P, Method>>
): string {
  if (!params) return path as string;

  if (typeof params === 'object') {
    return (path as string).replace(/\{(\w+)}/g, (_, key) => {
      if (key in params) {
        return encodeURIComponent((params as Record<string, any>)[key]);
      }
      throw new Error(`Missing parameter: ${key}`);
    });
  }

  throw new Error(
    `Expected params to be an object, but received: ${typeof params}`
  );
}

async function baseRequest<P extends Path, M extends Method>(
  path: P,
  method: M,
  body?: RequestBody<P, M>,
  params?: RequestParams<P, M>,
  config?: AxiosRequestConfig
): Promise<ResponseData<P, M>> {
  const url = resolvePathWithParams(path, params);

  const axiosConfig: AxiosRequestConfig = {
    method,
    url,
    data: body,
    ...config,
  };

  const response = await axiosInstance(axiosConfig);
  return response.data as ResponseData<P, M>;
}

const request = {
  async get<P extends Path>(
    path: P,
    params?: RequestParams<P, 'get'>,
    config?: AxiosRequestConfig
  ): Promise<ResponseData<P, 'get'>> {
    return baseRequest(path, 'get', undefined, params, config);
  },
  async post<P extends Path>(
    path: P,
    body?: RequestBody<P, 'post'>,
    config?: AxiosRequestConfig
  ): Promise<ResponseData<P, 'post'>> {
    return baseRequest(path, 'post', body, undefined, config);
  },
  async put<P extends Path>(
    path: P,
    body?: RequestBody<P, 'put'>,
    config?: AxiosRequestConfig
  ): Promise<ResponseData<P, 'put'>> {
    return baseRequest(path, 'put', body, undefined, config);
  },
  async delete<P extends Path>(
    path: P,
    params?: RequestParams<P, 'delete'>,
    config?: AxiosRequestConfig
  ): Promise<ResponseData<P, 'delete'>> {
    return baseRequest(path, 'delete', undefined, params, config);
  },
};

export { axiosInstance, request };
