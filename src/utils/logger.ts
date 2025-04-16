/**
 * 日志工具模块，提供不同级别的带时间戳的日志记录功能
 * @module logger
 */

import moment from 'moment';

/**
 * 表示不同日志级别的枚举，按照详细程度递增排序
 * - error (0): 需要立即关注的严重错误
 * - warn (1): 潜在问题的警告信息
 * - info (2): 应用程序流程的一般信息
 * - debug (3): 详细的调试信息
 */
enum ELoggerLeave {
  error = 0,
  warn = 1,
  info = 2,
  debug = 3,
}

/**
 * Logger实例的配置选项接口
 * @interface ILoggerOptions
 */
interface ILoggerOptions {
  /** 要输出的最高日志级别（error、warn、info或debug） */
  leave: keyof typeof ELoggerLeave;
}

/**
 * 日志记录器类，提供不同严重程度的日志输出方法
 * 每条日志消息包含：
 * - 日志级别指示器 [ERROR/WARN/INFO/DEBUG]
 * - YYYY-MM-DD HH:mm:ss 格式的时间戳
 * - 消息内容
 * - 任何额外参数
 */
class Logger {
  /** 当前最高日志级别。高于此级别的消息将不会被记录 */
  #leave: ELoggerLeave = ELoggerLeave.debug;

  /**
   * 创建一个新的Logger实例
   * @param {ILoggerOptions} opts - 日志记录器的配置选项
   */
  constructor(opts: ILoggerOptions) {
    this.#leave = ELoggerLeave[opts.leave];
  }

  /**
   * 内部方法，根据指定的级别处理实际的日志记录
   * 仅当消息的级别小于或等于记录器配置的级别时才记录
   * @param {ELoggerLeave} level - 日志的严重程度级别
   * @param {string} [message] - 要记录的消息
   * @param {...any[]} args - 要包含在日志中的其他参数
   */
  log(level: ELoggerLeave, message?: any, ...args: any[]) {
    if (ELoggerLeave[level] <= ELoggerLeave[this.#leave]) {
      switch (level) {
        case ELoggerLeave.error:
          console.error(
            `[${ELoggerLeave[level].toUpperCase()}] ${moment().format('YYYY-MM-DD HH:mm:ss')} ${message}`,
            ...args
          );
          break;
        case ELoggerLeave.warn:
          console.warn(
            `[${ELoggerLeave[level].toUpperCase()}] ${moment().format('YYYY-MM-DD HH:mm:ss')} ${message}`,
            ...args
          );
          break;
        case ELoggerLeave.info:
          console.info(
            `[${ELoggerLeave[level].toUpperCase()}] ${moment().format('YYYY-MM-DD HH:mm:ss')} ${message}`,
            ...args
          );
          break;
        case ELoggerLeave.debug:
          console.debug(
            `[${ELoggerLeave[level].toUpperCase()}] ${moment().format('YYYY-MM-DD HH:mm:ss')} ${message}`,
            ...args
          );
          break;
        default:
          break;
      }
    }
  }

  /**
   * 记录调试消息。用于开发过程中的详细信息
   * @param {string} [message] - 要记录的调试消息
   * @param {...any[]} args - 要包含在日志中的其他参数
   * @example
   * logger.debug('正在处理数据', { userId: 123, action: 'update' });
   */
  debug(message?: string, ...args: any[]) {
    this.log(ELoggerLeave.debug, message, ...args);
  }

  /**
   * 记录信息消息。用于应用程序流程的一般信息
   * @param {string} [message] - 要记录的信息消息
   * @param {...any[]} args - 要包含在日志中的其他参数
   * @example
   * logger.info('用户登录成功', { userId: 123 });
   */
  info(message?: string, ...args: any[]) {
    this.log(ELoggerLeave.info, message, ...args);
  }

  /**
   * 记录警告消息。用于潜在的问题情况
   * @param {string} [message] - 要记录的警告消息
   * @param {...any[]} args - 要包含在日志中的其他参数
   * @example
   * logger.warn('API调用次数接近限制', { remainingCalls: 10 });
   */
  warn(message?: string, ...args: any[]) {
    this.log(ELoggerLeave.warn, message, ...args);
  }

  /**
   * 记录错误消息。用于需要立即关注的严重错误
   * @param {string} [message] - 要记录的错误消息
   * @param {...any[]} args - 要包含在日志中的其他参数
   * @example
   * logger.error('数据库连接失败', { error: err });
   */
  error(message?: string, ...args: any[]) {
    this.log(ELoggerLeave.error, message, ...args);
  }
}

/**
 * 配置为debug级别日志记录的默认logger实例
 * 在应用程序中导入并使用此实例以保持日志记录的一致性
 * @example
 * import logger from './logger';
 *
 * logger.debug('调试信息');
 * logger.info('普通信息');
 * logger.warn('警告信息');
 * logger.error('错误信息');
 */
const logger = new Logger({ leave: 'debug' });
export default logger;
