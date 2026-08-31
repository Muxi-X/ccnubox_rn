import { ConsoleAdapter } from './adapters/console';
import {
  clearGlobalContext,
  getGlobalContext,
  setGlobalContext,
  updateGlobalContext,
} from './context';
import { LoggerCore } from './core';
import { LoggerAdapter, LoggerContext, LogLevel } from './types';

export * from './types';
export * from './context';
export * from './redactor';
export * from './core';
export * from './adapters/console';

declare const __DEV__: boolean | undefined;

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
const defaultMinLevel: LogLevel = isDev ? 'debug' : 'info';

export const loggerCore = new LoggerCore({
  minLevel: defaultMinLevel,
  adapters: [new ConsoleAdapter()],
});

export const logger = {
  trace: (
    message: string,
    data?: unknown,
    context?: Partial<LoggerContext>
  ): void => {
    loggerCore.dispatch('trace', message, data, context);
  },

  debug: (
    message: string,
    data?: unknown,
    context?: Partial<LoggerContext>
  ): void => {
    loggerCore.dispatch('debug', message, data, context);
  },

  info: (
    message: string,
    data?: unknown,
    context?: Partial<LoggerContext>
  ): void => {
    loggerCore.dispatch('info', message, data, context);
  },

  warn: (
    message: string,
    data?: unknown,
    context?: Partial<LoggerContext>
  ): void => {
    loggerCore.dispatch('warn', message, data, context);
  },

  error: (
    message: string,
    errorOrData?: unknown,
    context?: Partial<LoggerContext>
  ): void => {
    const error = errorOrData instanceof Error ? errorOrData : undefined;
    const data = errorOrData instanceof Error ? undefined : errorOrData;
    loggerCore.dispatch('error', message, data, context, error);
  },

  fatal: (
    message: string,
    errorOrData?: unknown,
    context?: Partial<LoggerContext>
  ): void => {
    const error = errorOrData instanceof Error ? errorOrData : undefined;
    const data = errorOrData instanceof Error ? undefined : errorOrData;
    loggerCore.dispatch('fatal', message, data, context, error);
  },

  setLevel: (level: LogLevel): void => {
    loggerCore.setMinLevel(level);
  },

  getLevel: (): LogLevel => {
    return loggerCore.getMinLevel();
  },

  addAdapter: (adapter: LoggerAdapter): void => {
    loggerCore.addAdapter(adapter);
  },

  removeAdapter: (name: string): void => {
    loggerCore.removeAdapter(name);
  },

  setContext: setGlobalContext,
  updateContext: updateGlobalContext,
  getContext: getGlobalContext,
  clearContext: clearGlobalContext,
};

export const LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

const NUMERIC_TO_LEVEL: Record<number, LogLevel> = {
  0: 'trace',
  1: 'debug',
  2: 'info',
  3: 'warn',
  4: 'error',
  5: 'fatal',
};

export const setLogLevel = (level: LogLevel | number = 'info'): void => {
  let targetLevel: LogLevel;
  if (typeof level === 'number') {
    targetLevel = NUMERIC_TO_LEVEL[level] ?? 'info';
  } else {
    targetLevel = level;
  }
  loggerCore.setMinLevel(targetLevel);
};

type LegacyLogFn = (..._args: unknown[]) => void;

const safeStringify = (val: unknown): string => {
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
};

const formatLegacyArgs = (
  args: unknown[]
): { message: string; data?: unknown; error?: Error } => {
  if (args.length === 0) {
    return { message: '' };
  }

  if (args.length === 1) {
    const [first] = args;
    if (first instanceof Error) {
      return { message: first.message, error: first };
    }
    if (typeof first === 'string') {
      return { message: first };
    }
    return { message: '', data: first };
  }

  const [first, second, ...rest] = args;
  const message = typeof first === 'string' ? first : safeStringify(first);

  if (second instanceof Error) {
    return {
      message,
      error: second,
      data: rest.length > 0 ? rest : undefined,
    };
  }

  const data = rest.length > 0 ? [second, ...rest] : second;
  return { message, data };
};

const createLegacyLogMethod =
  (level: LogLevel): LegacyLogFn =>
  (...args: unknown[]) => {
    const { message, data, error } = formatLegacyArgs(args);
    loggerCore.dispatch(level, message, data, undefined, error);
  };

export const log: Record<LogLevel, LegacyLogFn> = {
  trace: createLegacyLogMethod('trace'),
  debug: createLegacyLogMethod('debug'),
  info: createLegacyLogMethod('info'),
  warn: createLegacyLogMethod('warn'),
  error: createLegacyLogMethod('error'),
  fatal: createLegacyLogMethod('fatal'),
};

export default logger;
