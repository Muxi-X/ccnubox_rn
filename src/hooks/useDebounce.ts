import * as React from 'react';

import useTimeoutFn from './useTimeoutFn';

// 原始返回类型，保留以保持兼容性
export type UseDebounceReturn = [() => boolean | null, () => void];

/**
 * 防抖钩子函数
 * @param fn 需要防抖的函数
 * @param ms 延迟时间（毫秒）
 * @param deps 依赖数组，当依赖变化时重新创建防抖函数
 * @returns 防抖处理后的函数
 */
export default function useDebounce<T extends (...args: never[]) => unknown>(
  fn: T,
  ms: number = 0,
  deps: React.DependencyList = []
): T {
  const [, , reset] = useTimeoutFn(fn, ms);

  React.useEffect(reset, deps);

  // 返回一个包装函数，该函数会调用原始函数并重置定时器
  const debouncedFn = React.useCallback(
    (...args: Parameters<T>) => {
      reset();
      return fn(...args);
    },
    [fn, reset]
  );

  return debouncedFn as T;
}
