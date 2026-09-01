import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const compact = value => value.replace(/\s+/g, ' ').trim();

test('keeps the existing iOS and Android native configuration', () => {
  const config = read('react-native.config.js');

  assert.equal(
    (config.match(/unstable_reactLegacyComponentNames/g) ?? []).length,
    2,
    'both iOS and Android must retain the RNPdfRendererView legacy registration'
  );
  assert.match(
    config,
    /argument === 'bundle-harmony' \|\| argument === 'codegen-harmony'/,
    'only Harmony CLI compatibility paths may omit unsupported project fields'
  );
  assert.match(
    config,
    /android:\s*null,[\s\S]*ios:\s*null,/,
    'the Harmony-only Camera Roll bridge must not autolink into Android or iOS'
  );
});

test('keeps default toolchain settings and scopes Harmony output', () => {
  const babel = read('babel.config.js');
  const npmrc = read('.npmrc');
  const gitignore = read('.gitignore');

  assert.match(babel, /presets: \['babel-preset-expo'\]/);
  assert.doesNotMatch(babel, /unstable_transformImportMeta/);
  assert.doesNotMatch(npmrc, /strict-peer-dependencies/);
  assert.doesNotMatch(gitignore, /^\*\.(?:app|har|abc|ap|res|so|log)$/m);
  assert.match(gitignore, /^harmony\/\*\*\/\*\.so$/m);
});

test('uses original native modules by default and Harmony replacements only on Harmony', () => {
  assert.equal(
    read('src/platform/browser.ts').trim(),
    "export { openBrowserAsync } from 'expo-web-browser';"
  );
  assert.equal(
    read('src/platform/haptics.ts').trim(),
    "export * from 'expo-haptics';"
  );

  const storage = read('src/platform/storage.ts');
  const harmonyStorage = read('src/platform/storage.harmony.ts');
  assert.match(storage, /import \* as SecureStore from 'expo-secure-store';/);
  assert.match(storage, /export const getItem = SecureStore\.getItem;/);
  assert.match(storage, /export const setItem = SecureStore\.setItem;/);
  assert.doesNotMatch(storage, /AsyncStorage/);
  assert.match(harmonyStorage, /ExpoHarmonySecureStorage/);
  assert.doesNotMatch(harmonyStorage, /AsyncStorage/);
});

test('keeps native WebView and system UI paths intact', () => {
  for (const path of [
    'src/app/(mainPage)/electricity.tsx',
    'src/app/(mainPage)/map.tsx',
    'src/app/(mainPage)/webview.tsx',
    'src/components/scraper/index.tsx',
  ]) {
    const source = compact(read(path));
    assert.match(source, /isHarmony \? \(/);
    assert.match(source, /\) : \( <WebView/);
  }

  const rootLayout = read('src/app/_layout.tsx');
  const systemUI = read('src/utils/systemUI.ts');
  assert.doesNotMatch(rootLayout, /PlatformSystemBars|SystemBars/);
  assert.match(systemUI, /if \(isRunningInExpoGo\(\)\) return;/);
  assert.match(systemUI, /import\('react-native-edge-to-edge'\)/);
});

test('limits Harmony auth and layout behavior to Harmony', () => {
  const authLayout = read('src/app/auth/_layout.tsx');
  const request = compact(read('src/request/index.ts'));
  const visualScheme = compact(read('src/store/visualScheme.ts'));

  assert.match(authLayout, /zIndex: isHarmony \? undefined : -1/);
  assert.match(
    request,
    /if \(isHarmony && \(await isHarmonyDebugSessionEnabled\(\)\)\)/
  );
  assert.match(
    request,
    /if \(isHarmony && isHarmonyDebugCredential\(longToken\)\)/
  );
  assert.match(request, /typeof newShortToken !== 'string'/);
  assert.match(
    visualScheme,
    /const fallbackLayouts: LayoutName\[\] = \['ios', 'android'\]/
  );
});

test('retains the two security hardening exceptions', () => {
  const webview = read('src/app/(mainPage)/webview.tsx');
  const scraper = compact(read('src/components/scraper/index.tsx'));

  assert.match(webview, /const studentIdLiteral = JSON\.stringify/);
  assert.match(webview, /const storedCredentialLiteral = JSON\.stringify/);
  assert.match(scraper, /const storedCredential = .* \|\| '';/);
  assert.match(
    scraper,
    /const runFirst = storedCredential \? LOGIN_SCRAPER\(student_id, storedCredential\) : undefined;/
  );
});

test('uses the requested toolkit prerelease', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.equal(
    packageJson.devDependencies['expo-harmony-toolkit'],
    '2.0.0-next.1'
  );
});
