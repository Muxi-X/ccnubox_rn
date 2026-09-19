import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

import React from '@harmony-js/react';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const skiaRoot = path.dirname(
  require.resolve('@harmony-js/react-native-skia/package.json')
);
const skiaRequire = createRequire(path.join(skiaRoot, 'package.json'));

// Exercise the installed Skia host config with the real React reconciler.
// Only the native Skia node and Reanimated binding boundary are represented in memory.
const node = (type, props = {}) => ({
  type,
  props,
  items: [],
  children() {
    return this.items;
  },
  addChild(child) {
    this.items.push(child);
  },
  removeChild(child) {
    this.items.splice(this.items.indexOf(child), 1);
  },
  insertChildBefore(child, before) {
    this.items.splice(this.items.indexOf(before), 0, child);
  },
  setProps(value) {
    this.props = value;
  },
});
const nativeBoundary = {
  './HostComponents': {
    createNode: (_container, type, props) => node(type, props),
  },
  '../external/reanimated/renderHelpers': {
    extractReanimatedProps: props => [props, {}],
    bindReanimatedProps: (container, instance) => {
      instance.container = container;
    },
    unbindReanimatedNode: () => {},
  },
};
const load = filename => {
  const file = path.join(skiaRoot, 'src/renderer', filename);
  const output = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const exports = {};
  runInNewContext(
    output,
    {
      exports,
      console,
      setTimeout,
      clearTimeout,
      require: name =>
        name === 'react'
          ? React
          : (nativeBoundary[name] ??
            (name === './typeddash'
              ? load('typeddash.ts')
              : skiaRequire(name))),
    },
    { filename: file }
  );
  return exports;
};

test('Harmony Skia mounts, updates and unmounts React 19 nodes without losing their container', async () => {
  const { skHostConfig } = load('HostConfig.ts');
  const reconcilerFile = skiaRequire.resolve(
    'react-reconciler/cjs/react-reconciler.development.js'
  );
  const module = { exports: {} };
  runInNewContext(
    readFileSync(reconcilerFile, 'utf8'),
    {
      module,
      exports: module.exports,
      console,
      process,
      setTimeout,
      clearTimeout,
      require: name =>
        name === 'react' ? React : createRequire(reconcilerFile)(name),
    },
    { filename: reconcilerFile }
  );
  const reconciler = module.exports(skHostConfig);
  const container = { root: node('root'), redraw() {} };
  const fail = error => {
    throw error;
  };
  const root = reconciler.createContainer(
    container,
    0,
    null,
    false,
    null,
    '',
    fail,
    fail,
    fail,
    null
  );
  const render = element =>
    new Promise(resolve =>
      reconciler.updateContainer(element, root, null, resolve)
    );
  const Rect = ({ color }) => {
    const [type] = React.useState('skRect');
    return React.createElement(type, { color });
  };
  await render(React.createElement(Rect, { color: 'red' }));
  assert.equal(container.root.items.length, 1);
  assert.equal(container.root.items[0].props.color, 'red');
  await render(React.createElement(Rect, { color: 'blue' }));
  assert.equal(container.root.items[0].props.color, 'blue');
  assert.equal(container.root.items[0].container, container);
  await render(null);
  assert.equal(container.root.items.length, 0);
});
