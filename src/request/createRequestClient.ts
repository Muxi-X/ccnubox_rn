import { AxiosInstance, AxiosRequestConfig } from 'axios';

export type RequestParams<
  Paths,
  P extends keyof Paths,
  M extends keyof Paths[P],
> = Paths[P][M] extends {
  parameters: infer Params;
}
  ? Params extends object
    ? Omit<Params, 'header'> & { header?: any }
    : never
  : never;

export type RequestBody<
  Paths,
  P extends keyof Paths,
  M extends keyof Paths[P],
> = Paths[P][M] extends {
  requestBody: { content: { 'application/json': infer Body } };
}
  ? Body
  : Paths[P][M] extends {
        requestBody?: { content: { 'application/json'?: infer Body } };
      }
    ? Body
    : never;

export type ResponseData<
  Paths,
  P extends keyof Paths,
  M extends keyof Paths[P],
> = Paths[P][M] extends {
  responses: { 200: { content: { 'application/json': infer Data } } };
}
  ? Data
  : Paths[P][M] extends {
        responses: { 201: { content: { 'application/json': infer Data } } };
      }
    ? Data
    : any;

export function resolvePathWithParams(path: string, params?: any): string {
  if (!params || !params.query) {
    return path;
  }

  const query = params.query;
  if (typeof query === 'string') {
    return `${path}?${query}`;
  } else if (typeof query === 'object' && query !== null) {
    const queryParams = new URLSearchParams();
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        const value = query[key];
        if (Array.isArray(value)) {
          value
            .filter(item => item != null)
            .forEach(item => {
              queryParams.append(key, String(item));
            });
        } else if (value != null) {
          queryParams.append(key, String(value));
        }
      }
    }
    const queryString = queryParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  }

  return path;
}

export function createRequestClient<Paths extends Record<string, any>>(
  axiosInstance: AxiosInstance
) {
  type Path = keyof Paths;

  async function baseRequest<P extends Path, M extends keyof Paths[P] & string>(
    path: P,
    method: M,
    body?: RequestBody<Paths, P, M>,
    params?: RequestParams<Paths, P, M>,
    config?: AxiosRequestConfig
  ): Promise<ResponseData<Paths, P, M>> {
    const url = resolvePathWithParams(path as string, params);

    const headers = {
      ...(params && typeof params === 'object' && 'header' in params
        ? (params as any).header
        : {}),
      ...config?.headers,
    };

    const axiosConfig: AxiosRequestConfig = {
      method,
      url,
      data: body,
      ...config,
      headers: Object.keys(headers).length > 0 ? headers : config?.headers,
    };

    const response = await axiosInstance(axiosConfig);

    return response.data as ResponseData<Paths, P, M>;
  }

  return {
    async get<P extends Path>(
      path: P,
      params?: RequestParams<Paths, P, 'get' & keyof Paths[P]>,
      config?: AxiosRequestConfig
    ): Promise<ResponseData<Paths, P, 'get' & keyof Paths[P]>> {
      return baseRequest(path, 'get' as any, undefined, params, config);
    },
    async post<P extends Path>(
      path: P,
      body?: RequestBody<Paths, P, 'post' & keyof Paths[P]>,
      config?: AxiosRequestConfig
    ): Promise<ResponseData<Paths, P, 'post' & keyof Paths[P]>> {
      return baseRequest(path, 'post' as any, body, undefined, config);
    },
    async put<P extends Path>(
      path: P,
      body?: RequestBody<Paths, P, 'put' & keyof Paths[P]>,
      config?: AxiosRequestConfig
    ): Promise<ResponseData<Paths, P, 'put' & keyof Paths[P]>> {
      return baseRequest(path, 'put' as any, body, undefined, config);
    },
    async delete<P extends Path>(
      path: P,
      params?: RequestParams<Paths, P, 'delete' & keyof Paths[P]>,
      config?: AxiosRequestConfig
    ): Promise<ResponseData<Paths, P, 'delete' & keyof Paths[P]>> {
      return baseRequest(path, 'delete' as any, undefined, params, config);
    },
  };
}
