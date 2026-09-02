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

// 仅当 REDACTOR=false 时关闭脱敏，其余任何情况一律默认强制脱敏
const isRedactionEnabled =
  process.env.EXPO_PUBLIC_REDACTOR !== 'false' &&
  process.env.REDACTOR !== 'false';

export const loggerCore = new LoggerCore({
  minLevel: defaultMinLevel,
  adapters: [new ConsoleAdapter()],
  redactorOptions: {
    enabled: isRedactionEnabled,
  },
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

export default logger;
