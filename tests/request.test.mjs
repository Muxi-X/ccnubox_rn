import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';

import axios from 'axios';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const compiled = new Map();

// Load the real request modules with Node and the existing TypeScript compiler.
// Only HTTP, native platform dependencies and configured URLs are replaced.
function loadClients(t, { stored = { shortToken: 'short' }, respond } = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const storage = new Map(Object.entries(stored));
  const calls = [];
  const routes = [];
  const modules = new Map();
  const nativeStorage = {
    getItem: t.mock.fn(key => storage.get(key) ?? null),
    setItem: t.mock.fn((key, value) => storage.set(key, value)),
  };
  const transport = axios.create({
    adapter: async config => {
      calls.push(config);
      const result = (await respond?.(config)) ?? { data: { ok: true } };
      const response = {
        status: 200,
        statusText: 'OK',
        headers: {},
        data: undefined,
        config,
        ...result,
      };
      if (config.validateStatus && !config.validateStatus(response.status)) {
        throw new axios.AxiosError(
          `HTTP ${response.status}`,
          'ERR_BAD_RESPONSE',
          config,
          undefined,
          response
        );
      }
      return response;
    },
  });
  const replacements = {
    axios: transport,
    'expo-secure-store': nativeStorage,
    'expo-router': { router: { replace: route => routes.push(route) } },
    'expo-constants': {},
    'react-native': { Platform: { OS: 'ios' } },
    '@/constants/BASE_URLS': {
      BASE_URL: 'https://main.example',
      FEEDBACK_BASE_URL: 'https://feedback.example',
    },
  };

  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    if (!compiled.has(filename)) {
      compiled.set(
        filename,
        ts.transpileModule(readFileSync(filename, 'utf8'), {
          fileName: filename,
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
            esModuleInterop: true,
          },
        }).outputText
      );
    }
    const module = { exports: {} };
    modules.set(filename, module);
    const localRequire = name => {
      if (Object.hasOwn(replacements, name)) return replacements[name];
      if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
      const path = name.startsWith('@/')
        ? resolve(root, 'src', name.slice(2))
        : resolve(dirname(filename), name);
      return load(existsSync(`${path}.ts`) ? `${path}.ts` : `${path}/index.ts`);
    };
    runInThisContext(
      `(function(require, module, exports) {\n${compiled.get(filename)}\n})`,
      {
        filename,
      }
    )(localRequire, module, module.exports);
    return module.exports;
  }

  const clients = load(resolve(root, 'src/request/index.ts'));
  const bus = load(resolve(root, 'src/store/currentRequests.ts')).default;
  const events = load(resolve(root, 'src/utils/eventBus.ts')).default;
  let completeEvents = 0;
  events.on('request_complete', () => completeEvents++);
  t.after(() => {
    assert.equal(bus.resolvedRequestNum, bus.totalRequestNum);
    t.mock.timers.tick(1000);
    assert.equal(bus.totalRequestNum, 0);
    assert.equal(bus.resolvedRequestNum, 0);
    assert.equal(completeEvents, 1);
  });
  return { ...clients, bus, storage, calls, routes, nativeStorage };
}

for (const name of ['request', 'feedbackRequest']) {
  test(`${name}: preserves queries, header precedence, URL and response data`, async t => {
    const h = loadClients(t);
    const result = await h[name].get(
      '/records',
      {
        query: {
          ids: ['a b', null, undefined, 'c&d'],
          omitted: null,
          missing: undefined,
          empty: '',
          zero: 0,
        },
        header: { 'X-Source': 'params' },
      },
      { isToken: false, headers: { 'X-Source': 'config' } }
    );
    assert.deepEqual(result, { ok: true });
    assert.equal(h.calls[0].url, '/records?ids=a+b&ids=c%26d&empty=&zero=0');
    assert.equal(h.calls[0].headers['X-Source'], 'config');
    assert.equal(h.calls[0].headers.Authorization, undefined);
    assert.equal(
      h.calls[0].baseURL,
      name === 'request' ? 'https://main.example' : 'https://feedback.example'
    );
    assert.equal(h.nativeStorage.getItem.mock.callCount(), 0);
  });

  test(`${name}: preserves get/post/put/delete and raw queries`, async t => {
    const h = loadClients(t);
    await h[name].get(
      '/records',
      { query: 'ids=a%20b&ids=c' },
      { isToken: false }
    );
    await h[name].post('/records', { value: 1 }, { isToken: false });
    await h[name].put('/records', { value: 2 }, { isToken: false });
    await h[name].delete(
      '/records',
      { query: { id: 'a/b' } },
      { isToken: false }
    );
    assert.deepEqual(
      h.calls.map(c => [c.method, c.url, c.data]),
      [
        ['get', '/records?ids=a%20b&ids=c', undefined],
        ['post', '/records', '{"value":1}'],
        ['put', '/records', '{"value":2}'],
        ['delete', '/records?id=a%2Fb', undefined],
      ]
    );
  });

  for (const source of ['explicit', 'stored', 'refresh']) {
    test(`${name}: reads ${source} custom token and trims Authorization`, async t => {
      const h = loadClients(t, {
        stored: source === 'stored' ? { table: ' stored ' } : {},
      });
      const refresh = t.mock.fn(async () => ' refreshed ');
      await h[name].get('/records', undefined, {
        otherToken: {
          name: 'table',
          token: source === 'explicit' ? ' explicit ' : undefined,
          refresh,
        },
      });
      assert.equal(
        h.calls[0].headers.Authorization,
        `Bearer ${source === 'refresh' ? 'refreshed' : source}`
      );
      assert.equal(refresh.mock.callCount(), source === 'refresh' ? 1 : 0);
      assert.equal(
        h.nativeStorage.getItem.mock.callCount(),
        source === 'explicit' ? 0 : 1
      );
    });
  }

  test(`${name}: refreshes once and replays a 401 with the stored replacement`, async t => {
    const h = loadClients(t, {
      stored: { table: 'old' },
      respond: c => ({
        status: c._retry ? 200 : 401,
        data: { recovered: true },
      }),
    });
    const refresh = t.mock.fn(async function () {
      assert.equal(this.name, 'table');
      h.storage.set('table', 'new');
      return 'new';
    });
    const result = await h[name].get('/records', undefined, {
      otherToken: { name: 'table', refresh },
    });
    assert.deepEqual(result, { recovered: true });
    assert.equal(h.calls.length, 2);
    assert.equal(h.calls[1].headers.Authorization, 'Bearer new');
    assert.equal(refresh.mock.callCount(), 1);
    assert.equal(h.bus.totalRequestNum, 2);
  });

  test(`${name}: rejects the second 401 without refreshing again`, async t => {
    const h = loadClients(t, { respond: () => ({ status: 401 }) });
    const refresh = t.mock.fn(async () => 'new');
    const onRefreshError = t.mock.fn();
    await assert.rejects(
      h[name].get('/records', undefined, {
        otherToken: { name: 'table', token: 'fixed', refresh, onRefreshError },
      }),
      { message: 'HTTP 401' }
    );
    assert.equal(h.calls.length, 2);
    assert.equal(refresh.mock.callCount(), 1);
    assert.equal(onRefreshError.mock.callCount(), 0);
    assert.equal(h.calls[1].headers.Authorization, 'Bearer fixed');
    assert.deepEqual(h.routes, []);
  });

  test(`${name}: keeps its error when a custom token cannot be trimmed`, async t => {
    const h = loadClients(t);
    await assert.rejects(
      h[name].get('/records', undefined, {
        otherToken: { name: 'table', token: 123 },
      }),
      name === 'request' ? { message: 'token不存在' } : TypeError
    );
    assert.equal(h.calls.length, 0);
  });

  test(`${name}: keeps its 401 behavior when a custom refresher is missing`, async t => {
    const h = loadClients(t, { respond: () => ({ status: 401 }) });
    const onRefreshError = t.mock.fn();
    await assert.rejects(
      h[name].get('/records', undefined, {
        otherToken: { name: 'table', token: 'old', onRefreshError },
      }),
      {
        message: name === 'request' ? 'table 未配置 refresh' : 'HTTP 401',
      }
    );
    assert.equal(onRefreshError.mock.callCount(), name === 'request' ? 1 : 0);
    assert.equal(h.calls.length, 1);
    assert.deepEqual(h.routes, []);
  });

  test(`${name}: custom refresh failure reaches its callback and caller`, async t => {
    const failure = new Error('refresh failed');
    const h = loadClients(t, { respond: () => ({ status: 401 }) });
    const onRefreshError = t.mock.fn();
    await assert.rejects(
      h[name].get('/records', undefined, {
        otherToken: {
          name: 'table',
          token: 'old',
          refresh: async () => {
            throw failure;
          },
          onRefreshError,
        },
      }),
      error => error === failure
    );
    assert.equal(onRefreshError.mock.callCount(), 1);
    assert.equal(onRefreshError.mock.calls[0].arguments[0], failure);
    assert.equal(h.calls.length, 1);
    assert.deepEqual(h.routes, []);
  });

  test(`${name}: token lookup failure completes the request before transport`, async t => {
    const failure = new Error('storage unavailable');
    const h = loadClients(t);
    h.nativeStorage.getItem.mock.mockImplementation(() => {
      throw failure;
    });
    await assert.rejects(
      h[name].get('/records', undefined, {
        otherToken: { name: 'table', refresh: async () => 'unused' },
      }),
      name === 'request'
        ? { message: 'token不存在' }
        : error => error === failure
    );
    assert.equal(h.calls.length, 0);
    assert.equal(h.bus.totalRequestNum, 1);
  });

  test(`${name}: network and HTTP failures settle counts without retry`, async t => {
    const networkError = new Error('offline');
    const h = loadClients(t, {
      respond: c => {
        if (c.url === '/offline') throw networkError;
        return { status: 503 };
      },
    });
    const results = await Promise.allSettled([
      h[name].get('/offline', undefined, { isToken: false }),
      h[name].get('/unavailable', undefined, { isToken: false }),
    ]);
    assert.equal(results[0].reason, networkError);
    assert.equal(results[1].reason.response.status, 503);
    assert.equal(h.calls.length, 2);
  });

  test(`${name}: keeps the existing non-2xx check after validateStatus`, async t => {
    const h = loadClients(t, { respond: () => ({ status: 304 }) });
    await assert.rejects(
      h[name].get('/records', undefined, {
        isToken: false,
        validateStatus: () => true,
      }),
      { message: 'Error status code: 304' }
    );
    assert.equal(h.calls.length, 1);
  });
}

test('request: shares one short-token refresh across concurrent 401s', async t => {
  let releaseRefresh;
  const refreshGate = new Promise(resolve => {
    releaseRefresh = resolve;
  });
  let refreshStarted;
  const started = new Promise(resolve => {
    refreshStarted = resolve;
  });
  const h = loadClients(t, {
    stored: { shortToken: 'old', longToken: 'long' },
    respond: async c => {
      if (c.url.endsWith('/users/refresh_token')) {
        refreshStarted();
        await refreshGate;
        return { headers: { 'x-jwt-token': 'new' } };
      }
      return { status: c._retry ? 200 : 401, data: { ok: true } };
    },
  });
  const pending = Promise.all([h.request.get('/one'), h.request.get('/two')]);
  await started;
  // Let both rejected requests reach the shared refresh before releasing HTTP.
  await new Promise(resolve => setImmediate(resolve));
  releaseRefresh();
  assert.deepEqual(await pending, [{ ok: true }, { ok: true }]);
  const refreshCalls = h.calls.filter(c =>
    c.url.endsWith('/users/refresh_token')
  );
  assert.equal(refreshCalls.length, 1);
  assert.equal(refreshCalls[0].headers.Authorization, 'Bearer long');
  assert.equal(h.storage.get('shortToken'), 'new');
  assert.equal(
    h.calls
      .filter(c => c._retry)
      .every(c => c.headers.Authorization === 'Bearer new'),
    true
  );
  assert.equal(h.bus.totalRequestNum, 4);
});

test('request: missing long token on 401 keeps the login redirect', async t => {
  const h = loadClients(t, { respond: () => ({ status: 401 }) });
  await assert.rejects(h.request.get('/records'), {
    message: '长 token 不存在，跳转登录',
  });
  assert.deepEqual(h.routes, ['/auth/login']);
  assert.equal(h.calls.length, 1);
});

test('request: missing short token refreshes before sending the request', async t => {
  const h = loadClients(t, {
    stored: { longToken: 'long' },
    respond: c =>
      c.url.endsWith('/users/refresh_token')
        ? { status: 201, headers: { 'x-jwt-token': 'new' } }
        : { data: 'done' },
  });
  assert.equal(await h.request.get('/records'), 'done');
  assert.equal(h.calls[1].headers.Authorization, 'Bearer new');
  assert.equal(h.bus.totalRequestNum, 1);
});

test('feedbackRequest: missing otherToken rejects without login navigation', async t => {
  const h = loadClients(t);
  await assert.rejects(h.feedbackRequest.get('/records'), {
    message: '反馈接口未配置 otherToken',
  });
  assert.deepEqual(h.routes, []);
  assert.equal(h.calls.length, 0);
});

test('feedbackRequest: public 401 without a refresher is not replayed', async t => {
  const h = loadClients(t, { respond: () => ({ status: 401 }) });
  await assert.rejects(
    h.feedbackRequest.get('/records', undefined, { isToken: false }),
    { message: 'HTTP 401' }
  );
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.routes, []);
});

test('both clients share counts and wait for the last pending request', async t => {
  let releaseMain;
  const mainGate = new Promise(resolve => {
    releaseMain = resolve;
  });
  let mainStarted;
  const started = new Promise(resolve => {
    mainStarted = resolve;
  });
  const h = loadClients(t, {
    respond: async c => {
      if (c.baseURL === 'https://main.example') {
        mainStarted();
        await mainGate;
      }
    },
  });
  const pending = h.request.get('/records');
  await started;
  await h.feedbackRequest.get('/records', undefined, {
    isToken: false,
    headers: { Authorization: 'Custom unchanged' },
  });
  t.mock.timers.tick(1000);
  assert.equal(h.bus.totalRequestNum, 2);
  assert.equal(h.bus.resolvedRequestNum, 1);
  assert.equal(h.calls[1].headers.Authorization, 'Custom unchanged');
  releaseMain();
  await pending;
});
