import { ConsoleAdapter } from './adapters/console';
import { getGlobalContext } from './context';
import { Redactor } from './redactor';
import {
  LOG_LEVEL_WEIGHT,
  LogEvent,
  LoggerAdapter,
  LoggerConfig,
  LoggerContext,
  LogLevel,
} from './types';

export class LoggerCore {
  private minLevel: LogLevel = 'info';
  private adapters: LoggerAdapter[] = [];
  private redactor: Redactor;

  constructor(config?: Partial<LoggerConfig>) {
    this.minLevel = config?.minLevel ?? 'info';
    this.adapters = config?.adapters ?? [new ConsoleAdapter()];
    this.redactor = new Redactor(config?.redactorOptions);
  }

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public getMinLevel(): LogLevel {
    return this.minLevel;
  }

  public addAdapter(adapter: LoggerAdapter): void {
    this.adapters.push(adapter);
  }

  public removeAdapter(name: string): void {
    this.adapters = this.adapters.filter(a => a.name !== name);
  }

  public clearAdapters(): void {
    this.adapters = [];
  }

  public dispatch(
    level: LogLevel,
    message: string,
    data?: unknown,
    context?: Partial<LoggerContext>,
    error?: Error
  ): void {
    try {
      const eventWeight = LOG_LEVEL_WEIGHT[level];
      const thresholdWeight = LOG_LEVEL_WEIGHT[this.minLevel];

      if (eventWeight < thresholdWeight) {
        return;
      }

      const mergedContext: LoggerContext = {
        ...getGlobalContext(),
        ...(context || {}),
      };

      let redactedData = data;
      let redactedContext = mergedContext;
      try {
        redactedData =
          data !== undefined ? this.redactor.redact(data) : undefined;
        redactedContext = (this.redactor.redact(mergedContext) ||
          mergedContext) as LoggerContext;
      } catch {
        // 降级保护
      }

      const event: LogEvent = {
        level,
        message,
        timestamp: Date.now(),
        context: redactedContext,
        data: redactedData,
        error,
      };

      for (const adapter of this.adapters) {
        try {
          if (adapter.isEnabled && !adapter.isEnabled()) {
            continue;
          }
          adapter.log(event);
        } catch {
          // 适配器隔离
        }
      }
    } catch {
      // 管道全局隔离
    }
  }
}
