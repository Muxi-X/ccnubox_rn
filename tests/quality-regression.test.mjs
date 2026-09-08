import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test, { mock } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

const require = createRequire(import.meta.url);
const load = (path, modules) => {
  const exports = {};
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    {
      exports,
      require: name => {
        if (Object.hasOwn(modules, name)) return modules[name];
        if (name === 'react' || name === 'react/jsx-runtime')
          return require(name);
        throw new Error(`Unexpected import: ${name}`);
      },
      FormData,
      atob,
    }
  );
  return exports;
};

test('feedback rejects missing parent configuration before reading or uploading files', async () => {
  const getInfoAsync = mock.fn(async () => ({ exists: true, size: 3 }));
  const post = mock.fn(async () => ({ code: 0 }));
  const config = { parentType: 'bitable_image', parentNode: undefined };
  const { uploadFileToFeishuBitable } = load('src/utils/uploadPicture.ts', {
    'expo-file-system/legacy': {
      getInfoAsync,
      readAsStringAsync: async () => 'YWJj',
    },
    'react-native': { Platform: { OS: 'harmony' } },
    '@/platform/runtime': { isHarmony: true },
    '@/request': { request: { post } },
    '@/request/api/feedback/config': {
      FIXED_CONFIG: config,
    },
    './logger': { logger: { error: mock.fn(), info: mock.fn() } },
  });
  await assert.rejects(
    uploadFileToFeishuBitable('file:///test.png', 'test.png'),
    /未配置反馈附件父节点/
  );
  assert.equal(getInfoAsync.mock.callCount(), 0);
  assert.equal(post.mock.callCount(), 0);

  config.parentNode = 'fixture-parent';
  await uploadFileToFeishuBitable('file:///test.png', 'test.png');
  assert.equal(getInfoAsync.mock.callCount(), 1);
  assert.equal(post.mock.callCount(), 1);
  const form = post.mock.calls[0].arguments[1];
  assert.equal(form.get('parent_node'), 'fixture-parent');
  assert.equal(form.get('size'), '3');
  assert.equal(form.get('checksum'), '38600999');
});

test('course error boundary records the original error without throwing again', () => {
  const error = new Error('invalid course');
  const logError = mock.fn();
  const { default: Boundary } = load(
    'src/components/CourseTableErrorBoundary.tsx',
    {
      '@ant-design/react-native': { Button: 'Button' },
      'react-native': { Text: 'Text', View: 'View' },
      '@/utils/logger': { logger: { error: logError } },
    }
  );
  const boundary = new Boundary({ children: null });
  boundary.componentDidCatch(error, { componentStack: 'CourseTable' });
  assert.equal(logError.mock.callCount(), 1);
  assert.equal(logError.mock.calls[0].arguments[1], error);
  assert.equal(
    logError.mock.calls[0].arguments[2].componentStack,
    'CourseTable'
  );
  assert.equal(Boundary.getDerivedStateFromError(error).error, error);
});
