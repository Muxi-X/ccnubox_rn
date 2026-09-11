import type { AxiosInstance } from 'axios';

import requestBus from '@/store/currentRequests';
import type { OtherTokenConfig } from '@/types/axios';

interface TokenPolicy {
  getToken(config?: OtherTokenConfig): Promise<string>;
  getRefresher(config?: OtherTokenConfig): (() => Promise<string>) | undefined;
  mapTokenError?(error: unknown): unknown;
  onDefaultRefreshError?(error: unknown): void;
}

export function installRequestInterceptors(
  instance: AxiosInstance,
  tokenPolicy: TokenPolicy
) {
  instance.interceptors.request.use(async config => {
    requestBus.requestRegister();

    if (config.isToken === false) return config;

    try {
      const token = await tokenPolicy.getToken(config.otherToken);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token.trim()}`;
      }
    } catch (error) {
      throw tokenPolicy.mapTokenError
        ? tokenPolicy.mapTokenError(error)
        : error;
    }

    return config;
  });

  instance.interceptors.response.use(
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
        const tokenConfig = originalRequest.otherToken;
        const refresh = tokenPolicy.getRefresher(tokenConfig);

        if (refresh) {
          try {
            const newToken = await refresh();
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            // Do not await: a failed replay is not a token-refresh failure.
            return instance(originalRequest);
          } catch (refreshError) {
            if (tokenConfig) {
              tokenConfig.onRefreshError?.(refreshError);
            } else {
              tokenPolicy.onDefaultRefreshError?.(refreshError);
            }
            return Promise.reject(refreshError);
          }
        }
      }

      return Promise.reject(error);
    }
  );
}
