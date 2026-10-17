import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

import dayjs from 'dayjs';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(
  new URL('../src/platform/dateTime.ts', import.meta.url),
  'utf8'
);
const load = isHarmony => {
  const exports = {};
  runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }).outputText,
    {
      exports,
      Intl: isHarmony ? undefined : Intl,
      require: name => (name === './runtime' ? { isHarmony } : require(name)),
    }
  );
  return exports;
};

test('Harmony formats dates without the incomplete Hermes locale implementation', () => {
  const format = load(true);
  const date = new Date('2026-09-07T16:09:10Z');
  date.toLocaleString = date.toLocaleTimeString = () =>
    'dateFormat not implemented';
  assert.equal(
    format.formatCourseUpdateTime(date),
    dayjs(date).format('YYYY/MM/DD HH:mm:ss')
  );
  assert.equal(
    format.formatNotificationTime(date),
    dayjs(date).format('HH:mm')
  );
  assert.equal(format.formatFeedbackDate(date), '2026-09-08');
  assert.equal(
    format.formatFeedbackDate(new Date('2024-02-29T16:00:00Z')),
    '2024-03-01'
  );
});

test('native platforms retain their existing locale and timezone choices', () => {
  const format = load(false);
  const date = new Date('2026-09-07T16:09:10Z');
  assert.equal(
    format.formatCourseUpdateTime(date),
    date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  );
  assert.equal(
    format.formatNotificationTime(date),
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  assert.equal(format.formatFeedbackDate(date), '2026-09-08');
});
