import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

test('Harmony initializes ArkWeb before JPush capture and the RNOH worker', () => {
  const calls = [];
  const exports = {};
  const source = readFileSync(
    new URL(
      '../harmony/entry/src/main/ets/entryability/EntryAbility.ets',
      import.meta.url
    ),
    'utf8'
  );
  runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText,
    {
      exports,
      require: name => {
        if (name === '@ohos.web.webview')
          return {
            WebviewController: {
              initializeWebEngine: () => calls.push('arkweb'),
            },
          };
        if (name.endsWith('JPushColdStartStore'))
          return { installJPushColdStartCapture: () => calls.push('jpush') };
        return {
          RNAbility: class {
            context = { getApplicationContext: () => ({}) };
            onCreate() {
              calls.push('worker');
            }
          },
        };
      },
    }
  );
  new exports.default().onCreate({}, {});
  assert.deepEqual(calls, ['arkweb', 'jpush', 'worker']);
});

test('Harmony previews sandbox PDFs with ArkWeb without constructing PDFKit', () => {
  const require = createRequire(import.meta.url);
  const exports = {};
  const WebView = () => null;
  const code = readFileSync(
    new URL('../src/platform/pdfRenderer.harmony.tsx', import.meta.url),
    'utf8'
  );
  runInNewContext(
    ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    {
      exports,
      require: name => {
        assert.notEqual(name, '@react-native-ohos/react-native-pdf');
        return name === 'react-native-webview' ? { WebView } : require(name);
      },
    }
  );
  assert.equal(exports.default({}), null);
  const source = 'file:///data/storage/el2/base/files/calendar_2026.pdf';
  const view = exports.default({ source });
  assert.equal(view.type, WebView);
  assert.equal(view.props.source.uri, source);
  assert.equal(view.props.allowFileAccess, true);
  assert.equal(view.props.domStorageEnabled, true);
  assert.equal(view.props.javaScriptEnabled, true);
  assert.equal(view.props.scalesPageToFit, true);
  assert.deepEqual(Array.from(view.props.originWhitelist), ['file://*']);
  assert.equal(
    readFileSync(
      new URL('../src/platform/pdfRenderer.tsx', import.meta.url),
      'utf8'
    ),
    "export { default } from 'react-native-pdf-renderer';\n"
  );
});
