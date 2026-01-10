import 'axios';

export interface OtherTokenConfig {
  // token名称，用于区分不同 token
  name: string;
  // 如果已有 token，直接使用
  token?: string;
  // 自定义刷新逻辑
  refresh: () => Promise<string>;
  // 刷新失败回调
  onRefreshError?: (error: unknown) => void;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    isToken?: boolean;
    otherToken?: OtherTokenConfig;
  }
}
