export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

export interface LoggerContext {
  platform?: string;
  appVersion?: string;
  buildNumber?: string;
  environment?: string;
  isDev?: boolean;
  userId?: string | number;
  [key: string]: unknown;
}

export interface LogMetric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string | number | boolean>;
}

export interface LogEvent {
  level: LogLevel;
  message: string;
  timestamp: number;
  context: LoggerContext;
  data?: unknown;
  error?: Error;
  metric?: LogMetric;
}

export interface LoggerAdapter {
  name: string;
  isEnabled?: () => boolean;
  log: (_event: LogEvent) => void;
}

export interface RedactorOptions {
  enabled?: boolean;
  keys?: string[];
  mask?: string;
  maxDepth?: number;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  adapters: LoggerAdapter[];
  redactorOptions?: RedactorOptions;
  defaultContext?: Partial<LoggerContext>;
}
