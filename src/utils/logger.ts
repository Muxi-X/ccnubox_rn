/* eslint-disable no-console */

/**
 * 日志工具使用说明：
 *
 * 1. 导入日志工具：
 * ```ts
 * import { log, setLogLevel } from '@/utils/logger';
 * ```
 *
 * 2. 设置日志级别（可选，默认为 'fatal'）：
 * ```ts
 * setLogLevel('debug'); // 支持 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
 * setLogLevel(2);      // 也可以使用数字（0-5）设置级别
 * ```
 *
 * 3. 使用日志函数：
 * ```ts
 * log.trace('追踪信息');
 * log.debug('调试信息');
 * log.info('普通信息');
 * log.warn('警告信息');
 * log.error('错误信息');
 * log.fatal('致命错误');
 * ```
 *
 * 4. 支持多参数：
 * ```ts
 * log.info('用户登录', { userId: 123, time: new Date() });
 * ```
 *
 * 5. 日志级别优先级：
 * trace(0) < debug(1) < info(2) < warn(3) < error(4) < fatal(5)
 * 设置某个级别后，只会显示小于等于该级别的日志
 * 例如：设置 setLogLevel('info') 时，将显示 trace、debug、info 级别的日志
 */

import dayjs from 'dayjs';

// 日志级别类型定义
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// 日志级别映射到数值，用于比较级别
export const LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

// 日志颜色配置
const LOG_STYLES = {
  trace:
    'color: white; background-color: lightgreen; padding: 2px 6px; border-radius: 4px;',
  debug:
    'color: white; background-color: lightgreen; padding: 2px 6px; border-radius: 4px;',
  info: 'color: white; background-color: lightblue; padding: 2px 6px; border-radius: 4px;',
  warn: 'color: white; background-color: orange; padding: 2px 6px; border-radius: 4px;',
  error:
    'color: white; background-color: orange; padding: 2px 6px; border-radius: 4px;',
  fatal:
    'color: white; background-color: orange; padding: 2px 6px; border-radius: 4px;',
} as const;
// 控制台回退颜色（用于不支持颜色的环境）
const FALLBACK_COLORS = {
  trace: '[32m', // 绿色
  debug: '[32m',
  info: '[34m', // 蓝色
  warn: '[33m', // 黄色
  error: '[31m', // 红色
  fatal: '[35m', // 紫色
} as const;

// 初始化空的日志函数
export const log: Record<LogLevel, typeof console.log> = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
};

/**
 * 格式化日志输出
 * @param level - 日志级别
 * @returns 格式化后的日志前缀
 */
const format = (level: Uppercase<LogLevel>): string => {
  const time = dayjs().format('HH:mm:ss');
  return `%c${time}-${level}:`;
};

/**
 * 创建指定级别的日志函数
 * @param level - 日志级别
 * @returns 日志函数
 */
const createLogger = (level: LogLevel): typeof console.log => {
  const upperLevel = level.toUpperCase() as Uppercase<LogLevel>;

  // 根据日志级别选择合适的控制台方法
  const consoleMethod =
    level === 'trace' || level === 'debug'
      ? 'debug'
      : level === 'info'
        ? 'info'
        : level === 'warn'
          ? 'warn'
          : 'error';

  return console[consoleMethod]
    ? console[consoleMethod].bind(
        console,
        format(upperLevel),
        LOG_STYLES[level]
      )
    : console.log.bind(console, FALLBACK_COLORS[level], format(upperLevel));
};

/**
 * 设置日志级别
 * @param level - 要设置的日志级别，默认为 'fatal'
 */
export const setLogLevel = (
  level: keyof typeof LEVELS | number = 'fatal'
): void => {
  // 计算数值日志级别
  const numericLevel = typeof level === 'string' ? LEVELS[level] : level;

  // 重置所有日志函数为空函数
  Object.keys(LEVELS).forEach(key => {
    log[key as LogLevel] = () => {};
  });

  // 根据设置的级别启用相应的日志函数
  Object.keys(LEVELS)
    .filter(key => LEVELS[key as LogLevel] <= numericLevel)
    .forEach(key => {
      const logLevel = key as LogLevel;
      log[logLevel] = createLogger(logLevel);
    });
};

// 默认设置为 fatal 级别
setLogLevel('fatal');
