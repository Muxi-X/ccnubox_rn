import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';

import React from 'react';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const flush = () => new Promise(resolve => setImmediate(resolve));

// 使用现有 TypeScript 编译器加载真实源码，只替换原生边界和 Hook 调度。
function loadSource(entry, mocks = {}, scheduleTimeout = setTimeout) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const localRequire = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
      const target = name.startsWith('@/')
        ? path.join(root, 'src', name.slice(2))
        : path.resolve(path.dirname(filename), name);
      const resolved = ['.ts', '.tsx', '/index.ts', '/index.tsx']
        .map(suffix => target + suffix)
        .find(existsSync);
      assert.ok(resolved, `Cannot resolve ${name} from ${filename}`);
      return load(resolved);
    };
    const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filename,
    });
    runInThisContext(
      `(function(require, module, exports, setTimeout) {${outputText}\n})`,
      { filename }
    )(localRequire, module, module.exports, scheduleTimeout);
    return module.exports;
  }
  return load(path.join(root, entry));
}

const { buildTimetableLayout } = loadSource(
  'src/modules/courseTable/layout.ts'
);
const constants = loadSource('src/modules/courseTable/constants.ts');
const course = (overrides = {}) => ({
  id: 'course',
  classname: '高等数学',
  class_when: '1-2',
  day: 1,
  weeks: [1],
  week_duration: '1周',
  credit: 3,
  teacher: '教师',
  where: '教室',
  semester: '1',
  year: '2026',
  is_official: true,
  ...overrides,
});

test('布局保留 12 × 7 网格，过滤非法日期和节次，支持周日第 12 节', () => {
  for (const data of [[], undefined, null]) {
    const result = buildTimetableLayout(data, 1);
    assert.equal(result.timetableMatrix.length, 12);
    assert.ok(
      result.timetableMatrix.every(
        row => row.length === 7 && row.every(cell => cell === null)
      )
    );
    assert.deepEqual(result.visibleIds, []);
  }
  const invalid = [0, 8, 1.5, 'x'].map(day => course({ day }));
  invalid.push(
    ...['', '0', '13', '3-2', '1-13', '1,2', null].map(class_when =>
      course({ class_when })
    )
  );
  const result = buildTimetableLayout(
    [
      ...invalid,
      course({ id: 'last', day: '7', class_when: ' 12 ', weeks: null }),
    ],
    1
  );
  assert.deepEqual(result.visibleIds, ['last']);
  assert.equal(result.courses[0].date, '日');
  assert.equal(result.courses[0].rowIndex, 11);
  assert.equal(result.courses[0].colIndex, 6);
  assert.deepEqual(result.courses[0].weeks, []);
  assert.equal(result.courses[0].isThisWeek, false);
  assert.deepEqual(result.timetableMatrix[11][6], {
    classname: '高等数学',
    timeSpan: 1,
  });
});

test('同起始格保留本周、自定义课及输入顺序权重，不合并其他起始格', () => {
  const data = [
    course({ id: 'other-week', weeks: [2], is_official: false }),
    course({ id: 'official' }),
    course({ id: 'custom', is_official: false }),
    course({ id: 'last-custom', is_official: false }),
    course({ id: 'overlap', class_when: '2-3' }),
  ];
  const before = structuredClone(data);
  data.forEach(item => {
    Object.freeze(item.weeks);
    Object.freeze(item);
  });
  Object.freeze(data);
  assert.deepEqual(buildTimetableLayout(data, 1).visibleIds, [
    'last-custom',
    'overlap',
  ]);
  assert.deepEqual(buildTimetableLayout(data, 2).visibleIds, [
    'other-week',
    'overlap',
  ]);
  assert.deepEqual(data, before);
});

test('保留长列表索引权重和重复 id 的原有选择结果', () => {
  const longList = [
    course({ id: 'current' }),
    ...Array.from({ length: 200 }, () => course({ day: 0 })),
    course({ id: 'late', weeks: [] }),
  ];
  assert.deepEqual(buildTimetableLayout(longList, 1).visibleIds, ['late']);
  const duplicate = buildTimetableLayout(
    [
      course({ id: 'same', classname: 'first' }),
      course({ id: 'same', classname: 'second' }),
    ],
    1
  );
  assert.equal(duplicate.courses[0].courseName, 'first');
});

function hooks() {
  let cursor = 0;
  const cells = [];
  const pending = [];
  const useState = initial => {
    const index = cursor++;
    if (!(index in cells))
      cells[index] = typeof initial === 'function' ? initial() : initial;
    return [
      cells[index],
      value => {
        cells[index] = value;
      },
    ];
  };
  return {
    react: {
      ...React,
      useState,
      useRef: initial => useState(() => ({ current: initial }))[0],
      useMemo: calculate => calculate(),
      useEffect(effect, deps) {
        const index = cursor++;
        const previous = cells[index];
        if (
          !previous ||
          deps.some((dep, i) => !Object.is(dep, previous.deps[i]))
        ) {
          pending.push(() => {
            previous?.cleanup?.();
            cells[index] = { deps, cleanup: effect() };
          });
        }
      },
    },
    render(callback) {
      cursor = 0;
      const result = callback();
      pending.splice(0).forEach(effect => effect());
      return result;
    },
    unmount() {
      cells.forEach(cell => cell?.cleanup?.());
      cells.length = 0;
    },
  };
}

const backgroundPath =
  'src/modules/courseTable/components/CourseTableBackground.tsx';
const native = {
  Image: 'Image',
  View: 'View',
  Dimensions: { get: () => ({ width: 400, height: 800 }) },
  StyleSheet: {
    create: value => value,
    flatten: value => value,
    absoluteFill: { position: 'absolute', inset: 0 },
  },
};
const skia = {
  Canvas: 'Canvas',
  Image: 'SkImage',
  BackdropBlur: 'BackdropBlur',
  useImage: uri => (uri ? 'hook-image' : null),
  Skia: {
    Data: { fromURI: async () => 'data', fromBase64: value => value },
    Image: { MakeImageFromEncoded: value => `decoded:${value}` },
  },
};
const backgroundMocks = {
  '@shopify/react-native-skia': skia,
  'expo-file-system': {},
  'react-native': native,
};

test('背景在 Skia 与原生 Image 路径保留三种缩放、透明度和模糊参数', () => {
  const { CourseTableBackground } = loadSource(backgroundPath, backgroundMocks);
  for (const mode of ['cover', 'contain', 'stretch']) {
    for (const maskOpacity of [0, 35, 100]) {
      for (const blurRadius of [0, 12]) {
        const props = {
          uri: 'file://background',
          mode,
          maskOpacity,
          blurRadius,
          width: 240,
          height: 180,
          style: { position: 'absolute' },
        };
        const canvas = CourseTableBackground({ ...props, image: 'decoded' });
        const [image, blur] = canvas.props.children;
        assert.equal(canvas.type, 'Canvas');
        assert.deepEqual(image.props, {
          image: 'decoded',
          x: 0,
          y: 0,
          width: 240,
          height: 180,
          fit: mode === 'stretch' ? 'fill' : mode,
          opacity: 1 - maskOpacity / 100,
        });
        assert.equal(blur ? blur.props.blur : 0, blurRadius);
        const fallback = CourseTableBackground(props);
        assert.equal(fallback.type, 'Image');
        assert.deepEqual(fallback.props, {
          source: { uri: props.uri },
          resizeMode: mode,
          blurRadius,
          style: [props.style, { opacity: 1 - maskOpacity / 100 }],
        });
      }
    }
  }
});

test('背景加载保留 URI、base64、useImage 回退和清空行为', async () => {
  for (const outcome of ['uri', 'base64', 'read-error', 'uri-error']) {
    const h = hooks();
    let reads = 0;
    const { useCourseTableBackgroundImage: useBackground } = loadSource(
      backgroundPath,
      {
        ...backgroundMocks,
        react: h.react,
        '@shopify/react-native-skia': {
          ...skia,
          Skia: {
            ...skia.Skia,
            Data: {
              fromURI: async () => {
                if (outcome === 'uri-error') throw new Error('read failed');
                return outcome === 'uri' ? 'uri' : null;
              },
              fromBase64: value => value,
            },
          },
        },
        'expo-file-system': {
          readAsStringAsync: async (uri, options) => {
            reads++;
            assert.equal(uri, 'file://background');
            assert.deepEqual(options, { encoding: 'base64' });
            if (outcome === 'read-error') throw new Error('fallback failed');
            return 'base64';
          },
        },
      }
    );
    assert.equal(
      h.render(() => useBackground('file://background')),
      'hook-image'
    );
    await flush();
    assert.equal(
      h.render(() => useBackground('file://background')),
      outcome === 'uri' || outcome === 'base64'
        ? `decoded:${outcome}`
        : 'hook-image'
    );
    assert.equal(
      reads,
      outcome === 'base64' || outcome === 'read-error' ? 1 : 0
    );
    h.render(() => useBackground(undefined));
    assert.equal(
      h.render(() => useBackground(undefined)),
      null
    );
    h.unmount();
  }
});

test('URI 切换及卸载后，过期加载不能覆盖最新背景', async () => {
  const h = hooks();
  const resolve = new Map();
  const decoded = [];
  const { useCourseTableBackgroundImage: useBackground } = loadSource(
    backgroundPath,
    {
      ...backgroundMocks,
      react: h.react,
      '@shopify/react-native-skia': {
        ...skia,
        Skia: {
          Data: { fromURI: uri => new Promise(done => resolve.set(uri, done)) },
          Image: {
            MakeImageFromEncoded: value => {
              decoded.push(value);
              return value;
            },
          },
        },
      },
    }
  );
  h.render(() => useBackground('old'));
  h.render(() => useBackground('new'));
  resolve.get('new')('new-image');
  await flush();
  resolve.get('old')('old-image');
  await flush();
  assert.equal(
    h.render(() => useBackground('new')),
    'new-image'
  );
  h.render(() => useBackground('unmounted'));
  h.unmount();
  resolve.get('unmounted')('late-image');
  await flush();
  assert.deepEqual(decoded, ['new-image']);
});

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement(node)) return [];
  return [
    node,
    ...elements(node.props.children),
    ...elements(node.props.backgroundLayer),
  ];
}

test('课表反复挂载不会重复订阅，保存互斥且截图保留原生背景', async () => {
  const h = hooks();
  const bus = loadSource('src/utils/eventBus.ts', {
    './logger': { logger: { warn() {} } },
  }).default;
  const timers = [];
  const saved = [];
  let permissionCalls = 0;
  let resolvePermission;
  let captureCalls = 0;
  const Schedule = loadSource(
    'src/modules/courseTable/components/courseTable/index.tsx',
    {
      ...backgroundMocks,
      react: h.react,
      '@shopify/react-native-skia': {
        ...skia,
        makeImageFromView: async () => {
          captureCalls++;
          return { encodeToBase64: () => 'image-data' };
        },
      },
      'expo-image-manipulator': {
        SaveFormat: { PNG: 'png' },
        manipulateAsync: async () => ({ uri: 'file://saved.png' }),
      },
      'expo-media-library/legacy': {
        createAssetAsync: async uri => saved.push(uri),
      },
      '@/components/text': 'Text',
      '@/components/toast': { show() {} },
      '@/constants/PERMISSIONS': { PERMISSION_PURPOSES: {} },
      '@/constants/SCHEDULE': {
        ...constants,
        COURSE_COLLAPSE: 2,
        COURSE_HEADER_HEIGHT: 40,
        COURSE_ITEM_HEIGHT: 60,
        COURSE_ITEM_WIDTH: 70,
        TIME_WIDTH: 50,
      },
      '@/store/courseTableAppearance': () => ({
        backgroundUri: 'file://background',
        backgroundMode: 'cover',
        foregroundOpacity: 25,
        backgroundMaskOpacity: 35,
        backgroundBlurRadius: 12,
      }),
      '@/store/visualScheme': selector =>
        selector({ currentStyle: {}, themeName: 'light' }),
      '@/styles/common': { commonColors: {} },
      '@/utils/eventBus': bus,
      '@/utils/requestPermission': {
        requestPermission: () => {
          permissionCalls++;
          return new Promise(resolve => {
            resolvePermission = resolve;
          });
        },
      },
      './CourseContent': 'CourseContent',
      './StickyBottom': { StickyBottom: 'StickyBottom' },
      './StickyLeft': { StickyLeft: 'StickyLeft' },
      './StickyTop': { StickyTop: 'StickyTop' },
      './TimetableScrollView': 'TimetableScrollView',
    },
    callback => timers.push(callback)
  ).default;
  const render = () =>
    h.render(() =>
      Schedule({
        data: [course()],
        currentWeek: 1,
        onTimetableRefresh: async () => {},
      })
    );
  for (let i = 1; i <= 3; i++) {
    render();
    render();
    bus.emit('SaveImageShot');
    bus.emit('SaveImageShot');
    assert.equal(permissionCalls, i);
    resolvePermission(false);
    await flush();
    h.unmount();
    bus.emit('SaveImageShot');
    assert.equal(permissionCalls, i);
  }
  render();
  bus.emit('SaveImageShot');
  resolvePermission(true);
  await flush();
  const nodes = elements(render());
  const backgrounds = nodes.filter(
    node => node.type.name === 'CourseTableBackground'
  );
  assert.equal(backgrounds.length, 2);
  const snapshot = backgrounds.find(node => !node.props.image);
  assert.equal(snapshot.type(snapshot.props).type, 'Image');
  assert.equal(snapshot.props.maskOpacity, 35);
  assert.equal(snapshot.props.blurRadius, 12);
  assert.equal(nodes.filter(node => node.type === 'CourseContent').length, 2);
  for (const node of nodes) {
    if (node.props.ref && typeof node.props.ref === 'object')
      node.props.ref.current = {};
  }
  bus.emit('SaveImageShot');
  assert.equal(permissionCalls, 4);
  while (timers.length) {
    timers.shift()();
    await flush();
  }
  assert.equal(captureCalls, 1);
  assert.deepEqual(saved, ['file://saved.png']);
  assert.equal(
    elements(render()).filter(
      node => node.type.name === 'CourseTableBackground'
    ).length,
    1
  );
  h.unmount();
});
