import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('uses native Harmony application and clipboard data', () => {
  const metro = read('metro.harmony.config.js');
  const application = read('src/platform/harmonyExpoApplication.ts');
  const clipboard = read('.expo-harmony/shims/expo-clipboard/index.js');
  const etsPackage = read(
    'harmony/entry/src/main/ets/expoHarmony/ExpoHarmonyPackage.ets'
  );
  const cppPackage = read(
    'harmony/entry/src/main/cpp/expoHarmony/ExpoHarmonyPackage.h'
  );

  assert.match(metro, /'expo-application'/);
  assert.match(metro, /'expo-clipboard'/);
  assert.match(application, /ExpoHarmonySystem/);
  assert.match(clipboard, /@react-native-oh-tpl\/clipboard/);
  assert.doesNotMatch(clipboard, /let clipboardString/);
  assert.match(etsPackage, /ExpoHarmonySystemTurboModule/);
  assert.match(cppPackage, /ExpoHarmonySystemTurboModule/);
});

test('reports the current native version and keeps unsupported Harmony OTA explicit', () => {
  const appScope = read('harmony/AppScope/app.json5');
  const appJson = JSON.parse(read('app.json'));
  const updates = read('src/platform/harmonyExpoUpdates.ts');

  assert.match(appScope, new RegExp(`versionName: '${appJson.expo.version}'`));
  assert.match(updates, /export const isEnabled = false/);
  assert.match(updates, /export const runtimeVersion = null/);
  assert.match(updates, /export const updateId = null/);
  assert.match(
    read('src/app/(setting)/checkUpdate.tsx'),
    /鸿蒙版通过应用市场或安装包更新/
  );
});

test('enables Harmony feedback attachments through the existing native picker and filesystem', () => {
  const capabilities = read('src/platform/capabilities.ts');
  const feedback = read('src/app/(setting)/feedback/writefeedback.tsx');
  const nativePicker = read(
    'harmony/entry/src/main/ets/expoHarmony/ExpoHarmonyImagePickerTurboModule.ts'
  );

  assert.match(capabilities, /attachmentUpload: true/);
  assert.match(feedback, /launchImageLibraryAsync/);
  assert.match(feedback, /uploadFileToFeishuBitable/);
  assert.match(
    nativePicker,
    /isEditSupported = options\?\.allowsEditing === true/
  );
  assert.match(nativePicker, /imagePacker\.packToFile/);
});

test('renders Harmony PDFs and in-app browser content with maintained native adapters', () => {
  const packageJson = JSON.parse(read('package.json'));
  const pdf = read('src/platform/pdfRenderer.harmony.tsx');
  const browser = read('src/platform/browser.harmony.ts');
  const calendar = read('src/app/(mainPage)/calendar.tsx');
  const packageProvider = read(
    'harmony/entry/src/main/ets/PackageProvider.ets'
  );
  const moduleConfig = read('harmony/entry/src/main/module.json5');

  assert.equal(
    packageJson.dependencies['@react-native-ohos/react-native-pdf'],
    '7.0.0'
  );
  assert.equal(
    packageJson.dependencies[
      '@react-native-ohos/react-native-inappbrowser-reborn'
    ],
    '3.8.0'
  );
  assert.match(pdf, /@react-native-ohos\/react-native-pdf/);
  assert.match(browser, /@react-native-ohos\/react-native-inappbrowser-reborn/);
  assert.match(calendar, /isHarmony \? \(/);
  assert.match(packageProvider, /PdfViewPackage/);
  assert.match(packageProvider, /RNInAppBrowserPackage/);
  assert.match(moduleConfig, /BrowserManagerAbility/);
});

test('syncs a native Harmony course widget and triggers real haptics', () => {
  const capabilities = read('src/platform/capabilities.ts');
  const tabLayout = read('src/app/(tabs)/_layout.tsx');
  const widget = read('src/utils/updateWidget.harmony.ts');
  const nativeModule = read(
    'harmony/entry/src/main/ets/expoHarmony/ExpoHarmonySystemTurboModule.ts'
  );
  const widgetStore = read(
    'harmony/entry/src/main/ets/widget/CourseWidgetStore.ts'
  );
  const widgetAbility = read(
    'harmony/entry/src/main/ets/widget/CourseWidgetAbility.ets'
  );
  const widgetConfig = read(
    'harmony/entry/src/main/resources/base/profile/form_config.json'
  );
  const moduleConfig = read('harmony/entry/src/main/module.json5');

  assert.match(capabilities, /haptics: true/);
  assert.match(capabilities, /widgetSync: isAndroid \|\| isHarmony/);
  assert.match(tabLayout, /if \(platformCapabilities\.widgetSync\)/);
  assert.match(widget, /updateCourseWidget/);
  assert.match(nativeModule, /startVibration/);
  assert.match(widgetStore, /formProvider\.updateForm/);
  assert.match(
    widgetStore,
    /course\.day === day && course\.weeks\.includes\(currentWeek\)/
  );
  assert.match(widgetStore, /todayCourses\.sort/);
  assert.match(widgetStore, /course6: formatCourse/);
  assert.match(widgetStore, /WIDE_FORM_IDS_KEY/);
  assert.match(widgetAbility, /FormDimension\.Dimension_2_4/);
  assert.match(widgetConfig, /"2\*4"/);
  assert.match(moduleConfig, /CourseWidgetAbility/);
  assert.match(moduleConfig, /\$profile:form_config/);
});

test('uses native Harmony gradients, registered fonts, and edge-to-edge layout', () => {
  const packageJson = JSON.parse(read('package.json'));
  const gradient = read('src/platform/harmonyExpoLinearGradient.tsx');
  const index = read('harmony/entry/src/main/ets/pages/Index.ets');
  const capabilities = read('src/platform/capabilities.ts');

  assert.equal(
    packageJson.dependencies['@react-native-ohos/react-native-linear-gradient'],
    '3.2.0'
  );
  assert.match(gradient, /@react-native-ohos\/react-native-linear-gradient/);
  assert.match(index, /fontResourceByFontFamily/);
  assert.match(index, /antoutline/);
  assert.match(index, /MaterialIcons/);
  assert.match(index, /Ionicons/);
  assert.match(index, /expandSafeArea/);
  assert.match(capabilities, /edgeToEdge: true/);
});
