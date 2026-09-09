import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test, { mock } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

const require = createRequire(import.meta.url);
const load = (path, modules, globals = {}) => {
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
      ...globals,
    }
  );
  return exports;
};

test('direct Expo haptics imports reuse the existing Harmony native bridge', async () => {
  const metro = readFileSync(
    new URL('../metro.harmony.config.js', import.meta.url),
    'utf8'
  );
  assert.match(
    metro,
    /'expo-haptics': path\.resolve\(\s*__dirname,\s*'src\/platform\/haptics\.harmony\.ts'/
  );
  const triggerHaptic = mock.fn(async () => {});
  const haptics = load('src/platform/haptics.harmony.ts', {
    'react-native': {
      TurboModuleRegistry: {
        getEnforcing: name => {
          assert.equal(name, 'ExpoHarmonySystem');
          return { triggerHaptic };
        },
      },
    },
  });
  await haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
  await haptics.selectionAsync();
  assert.deepEqual(
    triggerHaptic.mock.calls.map(call => call.arguments[0]),
    ['light', 'selection']
  );
  assert.equal(
    readFileSync(
      new URL('../src/platform/haptics.ts', import.meta.url),
      'utf8'
    ),
    "export * from 'expo-haptics';\n"
  );
});

test('feedback preserves native file access and the existing multipart request on every platform', async () => {
  for (const platform of ['ios', 'android', 'harmony']) {
    const getInfoAsync = mock.fn(async () => ({ exists: true, size: 3 }));
    const readAsStringAsync = mock.fn(async () => 'YWJj');
    const post = mock.fn(async () => ({ code: 0 }));
    const config = { parentType: 'bitable_image', parentNode: undefined };
    const token = { name: 'fixture-upload-token' };
    class NativeFormData {
      parts = new Map();
      append(name, value) {
        this.parts.set(name, value);
      }
      get(name) {
        return this.parts.get(name);
      }
    }
    const { uploadFileToFeishuBitable } = load(
      'src/utils/uploadPicture.ts',
      {
        'expo-file-system': {
          getInfoAsync,
          readAsStringAsync,
          EncodingType: { Base64: 'native-base64' },
        },
        'react-native': { Platform: { OS: platform } },
        '@/platform/runtime': { isHarmony: platform === 'harmony' },
        '@/request': { request: { post } },
        '@/request/api/feedback/config': {
          FIXED_CONFIG: config,
          FeishuUploadTokenConfig: token,
        },
        './logger': { logger: { error: mock.fn(), info: mock.fn() } },
      },
      { FormData: NativeFormData }
    );
    await uploadFileToFeishuBitable('file:///test.png', 'test.png');
    assert.equal(getInfoAsync.mock.callCount(), 1);
    assert.equal(
      readAsStringAsync.mock.calls[0].arguments[1].encoding,
      platform === 'harmony' ? 'base64' : 'native-base64'
    );
    assert.equal(post.mock.callCount(), 1);
    const [url, form, options] = post.mock.calls[0].arguments;
    assert.equal(
      url,
      'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all'
    );
    assert.equal(form.get('parent_node'), undefined);
    assert.equal(form.get('parent_type'), 'bitable_image');
    assert.equal(form.get('file_name'), 'test.png');
    assert.equal(form.get('size'), '3');
    assert.equal(form.get('checksum'), '38600999');
    assert.equal(
      form.get('file').uri,
      platform === 'android' ? 'file:///test.png' : '/test.png'
    );
    assert.equal(form.get('file').type, 'image/png');
    assert.equal(options.otherToken, token);
    assert.equal(options.headers['Content-Type'], 'multipart/form-data');
  }
});

test('Harmony loopback fixtures never mount the real university login scraper', () => {
  const runtime = { isHarmony: true };
  const env = { EXPO_PUBLIC_API_URL: 'http://127.0.0.1:18787/api/v1' };
  const login = mock.fn(() => 'fixture script');
  const { default: Scraper } = load(
    'src/components/scraper/index.tsx',
    {
      'react-native': { View: 'View' },
      'react-native-webview': 'WebView',
      '@/components/webview/SafeWebView': 'SafeWebView',
      '@/constants/SCRAPERS': { LOGIN_SCRAPER: login },
      '@/platform/runtime': runtime,
      '@/store/user': selector =>
        selector({ student_id: 'fixture-id', password: 'fixture' }),
    },
    { process: { env } }
  );
  assert.equal(Scraper.render({}, null), null);
  assert.equal(login.mock.callCount(), 0);
  runtime.isHarmony = false;
  assert.notEqual(Scraper.render({}, null), null);
  runtime.isHarmony = true;
  env.EXPO_PUBLIC_API_URL = 'https://api.example.org/api/v1';
  assert.notEqual(Scraper.render({}, null), null);
});

test('feedback auth uses platform storage and retains token refresh and payload behavior', async () => {
  const axios = require('axios');
  const { createRequestClient } = load(
    'src/request/createRequestClient.ts',
    {}
  );
  for (const harmony of [false, true]) {
    let storedToken = 'cached-token';
    const getItem = mock.fn(() =>
      harmony ? Promise.resolve(storedToken) : storedToken
    );
    const storage = harmony
      ? load('src/platform/storage.harmony.ts', {
          'react-native': {
            TurboModuleRegistry: {
              getEnforcing: () => ({
                getItem,
                setItem() {},
                deleteItem() {},
              }),
            },
          },
        })
      : load('src/platform/storage.ts', { 'expo-secure-store': { getItem } });
    if (!harmony) assert.equal(storage.getItem, getItem);
    const requests = [];
    const refresh = mock.fn(async () => {
      storedToken = 'refreshed-token';
      return storedToken;
    });
    const { feedbackRequest } = load('src/request/feedbackRequest.ts', {
      axios: {
        defaults: { adapter: axios.defaults.adapter },
        create: config =>
          axios.create({
            ...config,
            adapter: async config => {
              requests.push({
                url: config.url,
                data: config.data,
                authorization: config.headers.Authorization,
              });
              const response = {
                status: requests.length === 1 ? 401 : 200,
                data: { code: 0 },
                headers: {},
                config,
              };
              if (response.status === 401)
                throw new axios.AxiosError(
                  'expired',
                  'ERR_BAD_REQUEST',
                  config,
                  null,
                  response
                );
              return response;
            },
          }),
      },
      '@/constants/BASE_URLS': {
        FEEDBACK_BASE_URL: 'https://feedback.example.invalid',
      },
      '@/platform/storage': storage,
      '@/store/currentRequests': { requestRegister() {}, requestComplete() {} },
      './createRequestClient': { createRequestClient },
    });
    const payload = {
      content: 'fixture feedback',
      images: ['fixture-file-token'],
    };
    await feedbackRequest.post('/api/v1/sheet/records', payload, {
      otherToken: { name: 'UserSheetToken', refresh },
    });
    assert.equal(requests.length, 2);
    assert.equal(getItem.mock.calls[0].arguments[0], 'UserSheetToken');
    assert.equal(refresh.mock.callCount(), 1);
    assert.equal(requests[0].url, '/api/v1/sheet/records');
    assert.deepEqual(JSON.parse(requests[0].data), payload);
    assert.equal(requests[0].authorization, 'Bearer cached-token');
    assert.equal(requests[1].authorization, 'Bearer refreshed-token');
  }
});
