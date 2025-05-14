import { Platform } from 'react-native';

import errorLogger from '@/request/api/errorLogger';

import { log } from './logger';

/**
 * 全局错误处理器
 */
export const setupGlobalErrorHandler = () => {
  const originalHandler = ErrorUtils.getGlobalHandler();

  const errorHandler = (error: Error, isFatal?: boolean) => {
    // 收集错误信息
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      isFatal,
      platform: Platform.OS,
      osVersion: Platform.Version,
      timestamp: new Date().toISOString(),
    };
    if (__DEV__) {
      log.error(errorInfo);
    } else {
      // 上报错误
      errorLogger('frontend', 'js_error', errorInfo);
    }

    // 调用原始处理器
    originalHandler(error, isFatal);
  };

  ErrorUtils.setGlobalHandler(errorHandler);
};
