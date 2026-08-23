import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const calendarSource = readFileSync(
  new URL('../src/app/(mainPage)/calendar.tsx', import.meta.url),
  'utf8'
);
const compact = value => value.replace(/\s+/g, ' ').trim();
const compactSource = compact(calendarSource);

test('keeps the existing iOS and Android calendar renderers', () => {
  assert.match(
    calendarSource,
    /^import \{ WebView \} from 'react-native-webview';$/m
  );

  const existingNativeRouting = compact(`
    Platform.select({
      ios: (
        <WebView
          style={[styles.webview, { width }]}
          source={{ uri: links[selectedYear], cache: true }}
          scalesPageToFit
          javaScriptEnabled
          domStorageEnabled
        />
      ),
      android: (
        <AndroidCalendarView
          url={links[selectedYear]}
          year={selectedYear}
        />
      ),
    })
  `);

  assert.ok(
    compactSource.includes(existingNativeRouting),
    'iOS and Android must keep the pre-Harmony Platform.select branches'
  );
});

test('adds SafeWebView only as the Harmony calendar branch', () => {
  assert.match(
    calendarSource,
    /^import \{ isHarmony \} from '@\/platform\/runtime';$/m
  );

  const harmonyStart = compactSource.indexOf('isHarmony ? (');
  const safeWebViewStart = compactSource.indexOf('<SafeWebView', harmonyStart);
  const nativeRoutingStart = compactSource.indexOf(
    'Platform.select({',
    safeWebViewStart
  );

  assert.notEqual(harmonyStart, -1, 'Harmony must have an explicit branch');
  assert.ok(
    safeWebViewStart > harmonyStart,
    'Harmony must render through SafeWebView'
  );
  assert.ok(
    nativeRoutingStart > safeWebViewStart,
    'the original native routing must remain the non-Harmony branch'
  );
});
