import * as React from 'react';

import useTimeoutFn from './useTimeoutFn';

export type UseDebounceReturn = [() => boolean | null, () => void];

/**
 * 防抖钩子函数
 * @param fn 需要防抖的函数
 * @param ms 延迟时间（毫秒）
 * @param deps 依赖数组，当依赖变化时重新创建防抖函数
 * @returns 防抖处理后的函数
 */
export default function useDebounce(
  fn: Function,
  ms: number = 0,
  deps: React.DependencyList = []
): UseDebounceReturn {
  const [isReady, cancel, reset] = useTimeoutFn(fn, ms);

  React.useEffect(reset, deps);

  return [isReady, cancel];
}
