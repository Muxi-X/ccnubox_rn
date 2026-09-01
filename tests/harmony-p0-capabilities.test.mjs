import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('stores Harmony credentials in Asset Store', () => {
  const storage = read('src/platform/storage.harmony.ts');
  const nativeModule = read(
    'harmony/entry/src/main/ets/expoHarmony/ExpoHarmonySecureStorageTurboModule.ts'
  );
  const etsPackage = read(
    'harmony/entry/src/main/ets/expoHarmony/ExpoHarmonyPackage.ets'
  );
  const cppPackage = read(
    'harmony/entry/src/main/cpp/expoHarmony/ExpoHarmonyPackage.h'
  );

  assert.match(storage, /TurboModuleRegistry\.getEnforcing/);
  assert.doesNotMatch(storage, /AsyncStorage/);
  assert.match(nativeModule, /@kit\.AssetStoreKit/);
  assert.match(nativeModule, /asset\.Tag\.SECRET/);
  assert.match(nativeModule, /asset\.SyncType\.NEVER/);
  assert.match(etsPackage, /ExpoHarmonySecureStorageTurboModule/);
  assert.match(cppPackage, /ExpoHarmonySecureStorageTurboModule/);
  assert.match(read('src/platform/capabilities.ts'), /'asset-store'/);
});

test('loads the Harmony course table and saves snapshots through native adapters', () => {
  const metro = read('metro.harmony.config.js');
  const imageManipulator = read('src/platform/harmonyExpoImageManipulator.ts');
  const etsPackages = read('harmony/entry/src/main/ets/PackageProvider.ets');
  const cppPackages = read('harmony/entry/src/main/cpp/PackageProvider.cpp');
  const cmake = read('harmony/entry/src/main/cpp/CMakeLists.txt');

  assert.match(metro, /'@shopify\/react-native-skia'/);
  assert.match(metro, /'expo-image-manipulator'/);
  assert.match(metro, /'expo-file-system\/legacy'/);
  assert.match(metro, /'expo-media-library\/legacy'/);
  assert.match(imageManipulator, /writeAsStringAsync/);
  assert.match(imageManipulator, /EncodingType\.Base64/);
  assert.match(etsPackages, /RNSkiaPackage/);
  assert.match(cppPackages, /SkiaPackage/);
  assert.match(cmake, /rnoh_skia/);
  assert.match(cmake, /ArkTSTurboModule::getContext/);
});

test('registers the maintained Harmony JPush adapter without replacing native clients', () => {
  const appConfig = read('app.config.ts');
  const packageJson = JSON.parse(read('package.json'));
  const metro = read('metro.harmony.config.js');
  const ohPackage = read('harmony/oh-package.json5');
  const etsPackages = read('harmony/entry/src/main/ets/PackageProvider.ets');
  const cppPackages = read('harmony/entry/src/main/cpp/PackageProvider.cpp');
  const cmake = read('harmony/entry/src/main/cpp/CMakeLists.txt');
  const jpushClient = read('src/utils/jpush.ts');
  const jpushHook = read('src/hooks/useJPush.ts');

  assert.equal(
    packageJson.dependencies['@react-native-ohos/jpush-react-native'],
    '3.2.1-1'
  );
  assert.equal(packageJson.dependencies['jpush-react-native'], '3.2.7');
  assert.equal(packageJson.dependencies['mx-jpush-expo'], '^1.4.0');
  assert.match(appConfig, /autoRegisterOnLaunch: false/);
  assert.match(metro, /@react-native-ohos\/jpush-react-native\/index\.js/);
  assert.match(ohPackage, /@react-native-ohos\/jpush-react-native/);
  assert.match(etsPackages, /RNJPushPackage/);
  assert.match(cppPackages, /JPushModulePackage/);
  assert.match(cmake, /rnoh_jPushModule/);
  assert.match(jpushClient, /isNotificationEnabled/);
  assert.match(jpushHook, /if \(isHarmony\)/);
  assert.match(
    jpushHook,
    /JPushSecrets\.channel \|\| \(isHarmony \? 'harmony' : ''\)/
  );
  assert.match(
    jpushHook,
    /production: process\.env\.EXPO_PUBLIC_ENV === 'production'/
  );
});

test('uses native Harmony storage, safe-area, gesture, screen, and cold-start push paths', () => {
  const metro = read('metro.harmony.config.js');
  const layout = read('src/app/_layout.tsx');
  const hook = read('src/hooks/useJPush.ts');
  const coldStartStore = read(
    'harmony/entry/src/main/ets/expoHarmony/JPushColdStartStore.ts'
  );
  const entryAbility = read(
    'harmony/entry/src/main/ets/entryability/EntryAbility.ets'
  );
  const moduleConfig = read('harmony/entry/src/main/module.json5');

  assert.match(metro, /@react-native-oh-tpl\/async-storage\/src\/index\.ts/);
  assert.match(
    metro,
    /@react-native-oh-tpl\/react-native-safe-area-context\/src\/index\.tsx/
  );
  assert.match(
    metro,
    /@react-native-oh-tpl\/react-native-screens\/src\/index\.ts/
  );
  assert.match(layout, /<Stack/);
  assert.doesNotMatch(layout, /<Slot/);
  assert.match(hook, /addLocalNotificationListener/);
  assert.match(hook, /consumeInitialNotificationOpened/);
  assert.match(hook, /message\.msgId/);
  assert.match(hook, /payload\.messageID === lastOpenedMessageId/);
  assert.match(coldStartStore, /onClickMessage:/);
  assert.match(entryAbility, /installJPushColdStartCapture/);
  assert.match(moduleConfig, /entity\.system\.browsable/);
  assert.match(moduleConfig, /ohos\.want\.action\.viewData/);
  assert.match(moduleConfig, /scheme: 'ccnubox'/);
});
