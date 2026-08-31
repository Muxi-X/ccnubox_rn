import { LoggerCore } from '../core';
/* eslint-disable no-console */
import { log, logger, setLogLevel } from '../index';
import { Redactor } from '../redactor';
import { LogEvent, LoggerAdapter, LOG_LEVEL_WEIGHT } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTests() {
  console.log('--- 开始 Logger 核心与管道层单元测试 ---');

  // 1. 权重定义测试
  assert(LOG_LEVEL_WEIGHT.trace === 10, 'trace 权重为 10');
  assert(LOG_LEVEL_WEIGHT.debug === 20, 'debug 权重为 20');
  assert(LOG_LEVEL_WEIGHT.info === 30, 'info 权重为 30');
  assert(LOG_LEVEL_WEIGHT.warn === 40, 'warn 权重为 40');
  assert(LOG_LEVEL_WEIGHT.error === 50, 'error 权重为 50');
  assert(LOG_LEVEL_WEIGHT.fatal === 60, 'fatal 权重为 60');
  console.log(
    '✔ 1. 日志级别权重定义正确 (trace:10 < debug:20 < info:30 < warn:40 < error:50 < fatal:60)'
  );

  // 2. 脱敏模块测试
  const redactor = new Redactor({ enabled: true });
  const rawObj = {
    student_id: '2023110001',
    password: 'secretPassword',
    user: {
      token: 'jwt_token',
      nested: {
        accessToken: 'access_123',
        safeKey: 'hello',
      },
    },
    list: [{ secret: 'top_secret' }, 'normal item'],
  };

  const redacted = redactor.redact(rawObj) as any;
  assert(
    redacted.student_id === '2023110001',
    '学号 student_id 不被脱敏，方便排查'
  );
  assert(redacted.password === '[REDACTED]', 'password 已脱敏');
  assert(redacted.user.token === '[REDACTED]', 'token 已脱敏');
  assert(
    redacted.user.nested.accessToken === '[REDACTED]',
    'nested accessToken 已脱敏'
  );
  assert(redacted.user.nested.safeKey === 'hello', 'nested safeKey 未脱敏');
  assert(redacted.list[0].secret === '[REDACTED]', 'secret 已脱敏');
  assert(redacted.list[1] === 'normal item', 'list[1] 未脱敏');

  // 循环引用脱敏
  const circular: any = { tag: 'loop' };
  circular.self = circular;
  const redactedCircular = redactor.redact(circular);
  assert(redactedCircular.tag === 'loop', '循环对象正常字段保留');
  assert(redactedCircular.self === '[Circular]', '循环引用转为 [Circular]');
  console.log('✔ 2. 敏感数据深层递归脱敏与 WeakSet 循环引用保护测试通过');

  // 3. 核心管道与级别过滤测试 (level >= minLevel)
  const events: LogEvent[] = [];
  const adapter: LoggerAdapter = {
    name: 'test_adapter',
    log: e => events.push(e),
  };

  const core = new LoggerCore({
    minLevel: 'warn',
    adapters: [adapter],
  });

  // 当阈值为 warn 时，trace、debug、info 被过滤
  core.dispatch('trace', 't1');
  core.dispatch('debug', 'd1');
  core.dispatch('info', 'i1');
  assert(events.length === 0, 'warn 阈值下 trace/debug/info 被过滤');

  // warn, error, fatal 正常通过
  core.dispatch('warn', 'w1');
  core.dispatch('error', 'e1');
  core.dispatch('fatal', 'f1');
  assert(events.length === 3, 'warn 阈值下 warn/error/fatal 正常分发');
  assert(events[0].level === 'warn', '事件 0 为 warn');
  assert(events[1].level === 'error', '事件 1 为 error');
  assert(events[2].level === 'fatal', '事件 2 为 fatal');

  // 动态修改级别为 debug
  core.setMinLevel('debug');
  events.length = 0;
  core.dispatch('trace', 't2');
  core.dispatch('debug', 'd2');
  assert(
    events.length === 1 && events[0].level === 'debug',
    '动态设为 debug 后只过滤 trace'
  );
  console.log(
    '✔ 3. 核心管道日志级别过滤 (levelWeight >= thresholdWeight) 测试通过'
  );

  // 4. 异常隔离 (Fail-Safe) 测试
  const crashAdapter: LoggerAdapter = {
    name: 'crasher',
    log: () => {
      throw new Error('Adapter crashed on purpose!');
    },
  };
  core.addAdapter(crashAdapter);
  try {
    core.dispatch('error', 'should not throw outside');
    console.log(
      '✔ 4. 异常隔离 Fail-Safe 测试通过（Adapter 抛错被安全隔离捕获）'
    );
  } catch {
    throw new Error('Fail-Safe 失败，Logger 核心向外抛出了异常');
  }

  // 5. 上下文合并与上下文脱敏测试
  events.length = 0;
  core.dispatch(
    'info',
    'test ctx',
    { extra: 123 },
    { userId: 'user_999', token: 'secret_token_123' }
  );
  assert(events[0].context.userId === 'user_999', '局部上下文 userId 合并正确');
  assert(events[0].context.token === '[REDACTED]', '上下文敏感字段被脱敏');
  console.log('✔ 5. 上下文合并与上下文敏感字段脱敏测试通过');

  // 6. 门面 logger 与向后兼容 log.* / setLogLevel 测试
  const facadeEvents: LogEvent[] = [];
  const facadeAdapter: LoggerAdapter = {
    name: 'facade_test_adapter',
    log: e => facadeEvents.push(e),
  };
  logger.addAdapter(facadeAdapter);
  setLogLevel('debug');

  facadeEvents.length = 0;
  logger.info('facade info test', { a: 1 });
  assert(
    facadeEvents.length === 1 && facadeEvents[0].message === 'facade info test',
    'logger.info 门面调用正常'
  );

  facadeEvents.length = 0;
  log.error('legacy error title', new Error('legacy detail'));
  assert(
    facadeEvents.length === 1 && facadeEvents[0].level === 'error',
    'log.error 兼容调用正常'
  );

  logger.removeAdapter('facade_test_adapter');
  console.log('✔ 6. logger 门面及 log.* 向后兼容接口测试通过');

  console.log('====================================');
  console.log('🎉 所有 Logger 核心与管道层测试全部顺利通过！');
  console.log('====================================');
}

runTests();
