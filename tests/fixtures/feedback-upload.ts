// Selected only by the Harmony Metro resolver with both API URLs set to loopback.
import { request as appRequest } from '../../src/request';

export const request = {
  post(
    url: string,
    body: FormData,
    config: Parameters<typeof appRequest.post>[2]
  ) {
    if (url !== 'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all') {
      throw new Error('Unexpected fixture upload URL');
    }
    return appRequest.post(
      'http://127.0.0.1:18787/fixture/upload' as any,
      body as any,
      config
    );
  },
};
