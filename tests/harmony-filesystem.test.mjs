import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test, { mock } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

test('Harmony downloads use bounded native HTTP, hash bytes and preserve failed destinations', async () => {
  const body = new Uint8Array([37, 80, 68, 70]).buffer;
  const request = mock.fn(async () => ({
    responseCode: 200,
    result: body,
    header: {},
  }));
  const destroy = mock.fn();
  const file = { fd: 7 };
  const fs = {
    OpenMode: { WRITE_ONLY: 1, CREATE: 2, TRUNC: 4, READ_ONLY: 8 },
    open: mock.fn(async () => file),
    read: mock.fn(async (_fd, buffer) => {
      new Uint8Array(buffer).set(new Uint8Array(body));
      return body.byteLength;
    }),
    write: mock.fn(async () => 4),
    close: mock.fn(),
    rename: mock.fn(),
    unlink: mock.fn(),
    mkdir: mock.fn(async () => {
      throw new Error('File exists');
    }),
    accessSync: () => true,
    stat: mock.fn(async () => ({ isDirectory: () => true })),
  };
  const modules = {
    '@ohos.file.fs': fs,
    '@ohos.net.http': {
      createHttp: () => ({ request, destroy }),
      HttpDataType: { ARRAY_BUFFER: 2 },
    },
    '@ohos.util': { generateRandomUUID: () => 'test' },
    '@ohos.security.cryptoFramework': {
      createMd: algorithm => {
        assert.equal(algorithm, 'MD5');
        const hash = createHash('md5');
        return {
          update: async ({ data }) => {
            hash.update(data);
          },
          digest: async () => ({ data: hash.digest() }),
        };
      },
    },
    '@rnoh/react-native-openharmony/ts': { AnyThreadTurboModule: class {} },
  };
  const source = readFileSync(
    new URL(
      '../harmony/entry/src/main/ets/expoHarmony/ExpoHarmonyFileSystemTurboModule.ts',
      import.meta.url
    ),
    'utf8'
  );
  const exports = {};
  runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText,
    { exports, ArrayBuffer, Uint8Array, require: name => modules[name] }
  );
  const adapter = Object.create(
    exports.ExpoHarmonyFileSystemTurboModule.prototype
  );
  adapter.normalizeSandboxPath = value => value;
  adapter.ensureParentDirectory = async () => {};
  const result = await adapter.download(
    'http://localhost/calendar.pdf',
    '/files/calendar.pdf'
  );
  assert.equal(result.uri, '/files/calendar.pdf');
  assert.equal(result.status, 200);
  assert.equal(request.mock.calls[0].arguments[1].maxLimit, 25 * 1024 * 1024);
  assert.equal(
    fs.rename.mock.calls[0].arguments[0],
    '/files/calendar.pdf.download-test'
  );
  fs.write.mock.mockImplementation(async () => {
    throw new Error('disk full');
  });
  await assert.rejects(
    adapter.download('http://localhost/calendar.pdf', '/files/calendar.pdf'),
    /disk full/
  );
  assert.equal(fs.rename.mock.calls.length, 1);
  assert.equal(fs.close.mock.calls.length, 2);
  assert.equal(
    fs.unlink.mock.calls[0].arguments[0],
    '/files/calendar.pdf.download-test'
  );
  assert.equal(destroy.mock.calls.length, 2);
  fs.write.mock.mockImplementation(async () => 4);
  fs.stat.mock.mockImplementation(async () => ({
    isDirectory: () => false,
    size: 4,
    mtime: 0,
  }));
  const expectedMd5 = createHash('md5')
    .update(new Uint8Array(body))
    .digest('hex');
  assert.equal(
    (
      await adapter.download(
        'http://localhost/calendar.pdf',
        '/files/calendar.pdf',
        {
          md5: true,
        }
      )
    ).md5,
    expectedMd5
  );
  assert.equal(
    (await adapter.getInfo('/files/calendar.pdf', { md5: true })).md5,
    expectedMd5
  );
  assert.equal((await adapter.getInfo('/files/calendar.pdf')).md5, undefined);
  fs.stat.mock.mockImplementation(async () => ({ isDirectory: () => true }));
  assert.equal(
    (await adapter.getInfo('/files/dir', { md5: true })).md5,
    undefined
  );
  await adapter.makeDirectory('/files/dir', { intermediates: true });
  await assert.rejects(adapter.makeDirectory('/files/dir'), /File exists/);
  fs.stat.mock.mockImplementation(async () => ({ isDirectory: () => false }));
  await assert.rejects(
    adapter.makeDirectory('/files/file', { intermediates: true }),
    /File exists/
  );
});
