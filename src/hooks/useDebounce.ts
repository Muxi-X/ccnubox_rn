import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 防抖钩子函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param deps 依赖数组，当依赖变化时重新创建防抖函数
 * @returns 防抖处理后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  deps: React.DependencyList = []
): T {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 清除定时器
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 组件卸载时清除定时器
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 创建防抖函数
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      cleanup();

      timerRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay, cleanup, ...deps]
  );

  return debouncedFn as T;
}

/**
 * 防抖值钩子函数
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖处理后的值
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
