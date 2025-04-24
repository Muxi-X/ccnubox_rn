import * as React from 'react';

export type UseTimeoutFnReturn = [() => boolean | null, () => void, () => void];

export default function useTimeoutFn(
  fn: Function,
  ms: number = 0
): UseTimeoutFnReturn {
  const ready = React.useRef<boolean | null>(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout>>();
  const callback = React.useRef(fn);

  const isReady = React.useCallback(() => ready.current, []);

  const set = React.useCallback(() => {
    ready.current = false;
    timeout.current && clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      ready.current = true;
      callback.current();
    }, ms);
  }, [ms]);

  const clear = React.useCallback(() => {
    ready.current = null;
    timeout.current && clearTimeout(timeout.current);
  }, []);

  React.useEffect(() => {
    callback.current = fn;
  }, [fn]);

  React.useEffect(() => {
    set();

    return clear;
  }, [ms]);

  return [isReady, clear, set];
}
