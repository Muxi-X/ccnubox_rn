import { RedactorOptions } from './types';

export const DEFAULT_SENSITIVE_KEYS: string[] = [
  'password',
  'passwd',
  'token',
  'secret',
  'authorization',
  'cookie',
];

export const DEFAULT_MASK = '[REDACTED]';
const DEFAULT_MAX_DEPTH = 8;

export class Redactor {
  private enabled: boolean;
  private sensitiveKeySet: Set<string>;
  private mask: string;
  private maxDepth: number;

  constructor(options?: RedactorOptions) {
    this.enabled = options?.enabled ?? true;
    const keys = options?.keys ?? DEFAULT_SENSITIVE_KEYS;
    this.sensitiveKeySet = new Set(keys.map(k => k.toLowerCase()));
    this.mask = options?.mask ?? DEFAULT_MASK;
    this.maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    if (this.sensitiveKeySet.has(lowerKey)) {
      return true;
    }
    for (const sensitiveKey of this.sensitiveKeySet) {
      if (lowerKey === sensitiveKey) {
        return true;
      }
      if (
        lowerKey.endsWith(`_${sensitiveKey}`) ||
        lowerKey.startsWith(`${sensitiveKey}_`) ||
        lowerKey.endsWith(sensitiveKey) ||
        lowerKey.startsWith(sensitiveKey)
      ) {
        return true;
      }
    }
    return false;
  }

  public redact<T>(target: T): T {
    if (!this.enabled) {
      return target;
    }

    const seen = new Set<object>();

    const internalRedact = (val: unknown, depth: number): unknown => {
      if (val === null || val === undefined) {
        return val;
      }

      if (typeof val !== 'object') {
        return val;
      }

      if (depth > this.maxDepth) {
        return '[MaxDepthExceeded]';
      }

      if (seen.has(val)) {
        return '[Circular]';
      }
      seen.add(val);

      try {
        if (Array.isArray(val)) {
          return val.map(item => internalRedact(item, depth + 1));
        }

        if (val instanceof Error) {
          const errorCopy: Record<string, unknown> = {
            name: val.name,
            message: val.message,
            stack: val.stack,
          };
          try {
            for (const [k, v] of Object.entries(val)) {
              if (this.isSensitiveKey(k)) {
                errorCopy[k] = this.mask;
              } else {
                errorCopy[k] = internalRedact(v, depth + 1);
              }
            }
          } catch {
            // Error 自定义属性遍历异常时，安全返回基础结构
          }
          return errorCopy;
        }

        try {
          const result: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(val)) {
            if (this.isSensitiveKey(key)) {
              result[key] = this.mask;
            } else {
              result[key] = internalRedact(value, depth + 1);
            }
          }
          return result;
        } catch {
          return '[Unredactable]';
        }
      } finally {
        seen.delete(val);
      }
    };

    try {
      return internalRedact(target, 0) as T;
    } catch {
      return '[Unredactable]' as unknown as T;
    }
  }
}
