require('./.expo-harmony/shims/runtime-prelude.js');

const React = require('react');
const jsxRuntime = require('react/jsx-runtime');
const { AppRegistry } = require('react-native');
const { registerRootComponent } = require('expo');
const { ExpoRoot } = require('expo-router');

const appRoot = './src/app';

process.env.EXPO_ROUTER_APP_ROOT = appRoot;
process.env.EXPO_ROUTER_IMPORT_MODE = 'sync';

const describeElementType = type => {
  if (type == null) {
    return String(type);
  }

  if (typeof type === 'string') {
    return type;
  }

  return type.displayName || type.name || Object.prototype.toString.call(type);
};

const wrapJsxFactory = factoryName => {
  const originalFactory = jsxRuntime[factoryName];

  if (typeof originalFactory !== 'function') {
    return;
  }

  jsxRuntime[factoryName] = function patchedJsx(
    type,
    config,
    maybeKey,
    source,
    self
  ) {
    if (type == null) {
      console.error('[Harmony JSX] Invalid element type', {
        factoryName,
        key: maybeKey,
        type,
        propKeys: config ? Object.keys(config) : [],
        childrenType: config?.children
          ? describeElementType(config.children?.type)
          : typeof config?.children,
        stack: new Error().stack,
      });
    }

    return originalFactory.call(this, type, config, maybeKey, source, self);
  };
};

wrapJsxFactory('jsx');
wrapJsxFactory('jsxs');
wrapJsxFactory('jsxDEV');

const context = require.context(
  appRoot,
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+html)|(?:\+middleware)))\.[jt]sx?$).*(?:\.ios|\.web)?\.[jt]sx?$/
);

function App() {
  return React.createElement(ExpoRoot, {
    context,
  });
}

registerRootComponent(App);
AppRegistry.registerComponent('ccnubox', () => App);
