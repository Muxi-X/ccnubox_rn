import { setItem } from 'expo-secure-store';

import { FEEDBACK_BASE_URL, FEEDBACK_DEV_BASE_URL } from './constants';
import getFeedbackToken from './getFeedbackToken';
import getFeishuToken from './getFeishuToken';

const ISDEV = __DEV__;

export const BASE_URL = ISDEV ? FEEDBACK_DEV_BASE_URL : FEEDBACK_BASE_URL;

export const FIXED_CONFIG = {
  parentType: 'bitable_image',
  parentNode: ISDEV
    ? 'N4TcbHEPgaCvAIsrUspciX13nq8'
    : 'LC8aboXkCaAJaksSACOc9OS5nHf',
};

interface GetAndSetTokenProps<T> {
  tokenKey: string;
  fetchToken: () => Promise<T>;
  getToken: (res: T) => string;
  errorMessage: string;
}

const getAndSetToken = async <T>({
  tokenKey,
  fetchToken,
  getToken,
  errorMessage,
}: GetAndSetTokenProps<T>): Promise<string> => {
  const res = await fetchToken();

  const token = getToken(res);

  if (!token) {
    throw new Error(errorMessage);
  }

  await setItem(tokenKey, token);

  return token;
};

/*
  这里对于飞书的上传token单独处理，不通过setItem存储，从而使得每次都通过refresh重新获取token，
  因为飞书token过期返回400，不会走拦截器401的自动刷新，而且没必要为了这个修改拦截逻辑，所以先这样了
*/
export const FeishuUploadTokenConfig = {
  name: 'FeishuUploadToken',
  refresh: async () => {
    const res = (await getFeishuToken()) as any;
    const token = res?.data?.access_token;

    if (!token) {
      throw new Error('获取飞书上传 token 失败');
    }

    return token;
  },
};

export const UserSheetTokenConfig = {
  name: 'UserSheetToken',
  refresh: () =>
    getAndSetToken<any>({
      tokenKey: 'UserSheetToken',
      fetchToken: () => getFeedbackToken({ table_identify: 'ccnubox' }),
      getToken: res => res?.data?.access_token,
      errorMessage: '获取用户反馈表token失败',
    }),
};

export const FAQTokenConfig = {
  name: 'FAQToken',
  refresh: () =>
    getAndSetToken<any>({
      tokenKey: 'FAQToken',
      fetchToken: () => getFeedbackToken({ table_identify: 'ccnubox-faq' }),
      getToken: res => res?.data?.access_token,
      errorMessage: '获取FAQToken失败',
    }),
};
