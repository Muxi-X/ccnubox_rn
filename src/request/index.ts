import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { getItem, setItem } from 'expo-secure-store';

import Toast from '@/components/toast';

import requestBus from '@/store/currentRequests';

import { paths } from './schema';

import { OtherTokenConfig } from '@/types/axios';

// 这一块逻辑和匣子接口强耦合，不适用反馈接口，所以加了些扩展，默认为原逻辑
const axiosInstance: AxiosInstance = axios.create({
  // baseURL: process.env.EXPO_PUBLIC_API_URL,
  baseURL: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL,
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

async function refreshToken(config?: OtherTokenConfig): Promise<string> {
  if (!config) {
    const longToken = getItem('longToken');
    if (!longToken) throw new Error('长 token 不存在');

    // 刷新短 token
    const response = await axios.get(
      // `${process.env.EXPO_PUBLIC_API_URL}/users/refresh_token`,
      `${Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL}/users/refresh_token`,
      {
        headers: { Authorization: `Bearer ${longToken}` },
      }
    );

    if (response.status === 200 || response.status === 201) {
      const newShortToken = response.headers['x-jwt-token'];
      //   console.log(newShortToken);
      setItem('shortToken', newShortToken);
      return newShortToken;
    }

    throw new Error('刷新短 token 失败');
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

    switch (response.status) {
      case 200:
        return response;
      case 401:
        throw new Error('token过期');
      //  break;
      case 403:
        Toast.show({ text: '无权限' });
        break;
      default:
        Toast.show({ text: '服务器错误' });
    }
    return Promise.reject(new Error(`Error status code: ${response.status}`));
  },
  async error => {
    requestBus.requestComplete();
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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
  params?: RequestParams<P, Method>
): string {
  // @ts-expect-error 2339 never type
  if (!params || !params.query) {
    return path as string;
  }

  if (typeof params === 'object' && 'query' in params) {
    // @ts-expect-error 2339 never type
    const query = params.query;
    if (typeof query === 'string') {
      return `${path as string}?${query}`;
    } else if (typeof query === 'object') {
      const queryParams = new URLSearchParams();
      for (const key in query) {
        if (Object.prototype.hasOwnProperty.call(query, key)) {
          queryParams.append(key, query[key]);
        }
      }
      const queryString = queryParams.toString();
      return `${path as string}?${queryString}`;
    } else {
      throw new Error(
        `Expected query to be an object or string, but received: ${typeof query}`
      );
    }
  } else {
    throw new Error(
      `Expected params to be an object with a query property, but received: ${typeof params}`
    );
  }
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

export { request };
