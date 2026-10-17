import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const calendarSource = readFileSync(
  new URL('../src/app/(mainPage)/calendar.tsx', import.meta.url),
  'utf8'
);
const compact = value => value.replace(/\s+/g, ' ').trim();
const compactSource = compact(calendarSource);

test('preserves the Android File API cache and download path', () => {
  assert.match(
    calendarSource,
    /import \{ File as ExpoFile, Paths \} from 'expo-file-system';/
  );
  assert.ok(
    compactSource.includes(
      compact(`
    const localFile = new ExpoFile(Paths.document, \`calendar_\${year}.pdf\`);
    if (localFile.exists) {
      setSource(localFile.uri);
      setDownloading(false);
      return;
    }
    ExpoFile.downloadFileAsync(url, localFile)
      .then(file => setSource(file.uri))
  `)
    )
  );
});

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

test('adds the native PDF renderer only as the Harmony calendar branch', () => {
  assert.match(
    calendarSource,
    /^import \{ isHarmony \} from '@\/platform\/runtime';$/m
  );

  const harmonyStart = compactSource.indexOf('isHarmony ? (');
  const harmonyPdfStart = compactSource.indexOf(
    '<AndroidCalendarView',
    harmonyStart
  );
  const nativeRoutingStart = compactSource.indexOf(
    'Platform.select({',
    harmonyPdfStart
  );

  assert.notEqual(harmonyStart, -1, 'Harmony must have an explicit branch');
  assert.ok(
    harmonyPdfStart > harmonyStart,
    'Harmony must render through the native PDF adapter'
  );
  assert.ok(
    nativeRoutingStart > harmonyPdfStart,
    'the original native routing must remain the non-Harmony branch'
  );
});
