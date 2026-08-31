/* eslint-disable no-console */
import dayjs from 'dayjs';

import { LogEvent, LogLevel, LoggerAdapter } from '../types';

const LOG_STYLES: Record<LogLevel, string> = {
  trace:
    'color: white; background-color: #8c8c8c; padding: 2px 6px; border-radius: 4px;',
  debug:
    'color: white; background-color: #52c41a; padding: 2px 6px; border-radius: 4px;',
  info: 'color: white; background-color: #1890ff; padding: 2px 6px; border-radius: 4px;',
  warn: 'color: white; background-color: #fa8c16; padding: 2px 6px; border-radius: 4px;',
  error:
    'color: white; background-color: #f5222d; padding: 2px 6px; border-radius: 4px;',
  fatal:
    'color: white; background-color: #722ed1; padding: 2px 6px; border-radius: 4px;',
};

const FALLBACK_COLORS: Record<LogLevel, string> = {
  trace: '\x1b[90m',
  debug: '\x1b[32m',
  info: '\x1b[34m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  fatal: '\x1b[35m',
};

const RESET_COLOR = '\x1b[0m';

export class ConsoleAdapter implements LoggerAdapter {
  public name = 'console';

  public log(event: LogEvent): void {
    const { level, message, timestamp, data, error, context } = event;
    const timeStr = dayjs(timestamp).format('HH:mm:ss');
    const upperLevel = level.toUpperCase();

    const consoleMethod = this.resolveConsoleMethod(level);

    const isBrowserLike =
      typeof window !== 'undefined' && typeof window.document !== 'undefined';

    const outputArgs: unknown[] = [];

    if (isBrowserLike) {
      const prefix = `%c[${timeStr}] [${upperLevel}]`;
      outputArgs.push(prefix, LOG_STYLES[level], message);
    } else {
      const color = FALLBACK_COLORS[level] || '';
      const prefix = `${color}[${timeStr}] [${upperLevel}]${RESET_COLOR}`;
      outputArgs.push(`${prefix} ${message}`);
    }

    if (data !== undefined) {
      outputArgs.push(data);
    }

    if (error !== undefined) {
      outputArgs.push(error);
    }

    if (context) {
      try {
        const extraContext: Record<string, unknown> = {};
        const baseKeys = new Set([
          'platform',
          'appVersion',
          'buildNumber',
          'environment',
          'isDev',
        ]);
        for (const [k, v] of Object.entries(context)) {
          if (!baseKeys.has(k) && v !== undefined) {
            extraContext[k] = v;
          }
        }
        if (Object.keys(extraContext).length > 0) {
          outputArgs.push({ context: extraContext });
        }
      } catch {
        // 忽略 context 解析异常
      }
    }

    try {
      console[consoleMethod](...outputArgs);
    } catch {
      try {
        console.log(...outputArgs);
      } catch {
        // 兜底保护
      }
    }
  }

  private resolveConsoleMethod(
    level: LogLevel
  ): 'debug' | 'info' | 'warn' | 'error' | 'log' {
    switch (level) {
      case 'trace':
      case 'debug':
        return typeof console.debug === 'function' ? 'debug' : 'log';
      case 'info':
        return typeof console.info === 'function' ? 'info' : 'log';
      case 'warn':
        return typeof console.warn === 'function' ? 'warn' : 'log';
      case 'error':
      case 'fatal':
        return typeof console.error === 'function' ? 'error' : 'log';
      default:
        return 'log';
    }
  }
}
