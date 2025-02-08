import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    isToken?: boolean;
  }
}
