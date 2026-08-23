import { forwardRef, type ForwardedRef } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';

import { ScraperProps } from '@/components/scraper/types';
import SafeWebView, {
  SafeWebViewHandle,
} from '@/components/webview/SafeWebView';
import { LOGIN_SCRAPER } from '@/constants/SCRAPERS';
import { isHarmony } from '@/platform/runtime';
import useUserStore from '@/store/user';

/**
 * 爬虫组件，用于爬取研究生课表、成绩
 * 位于全局，通过 ref 调用
 * @example
 * const inject = useScraper(state => state.injectJavaScript);
 * //...
 * <Button
 *    onPress={() => {
 *      inject(scrapeCourse(2024, semesterMap.first));
 *    }}
 * >
 *    课表测试
 * </Button>
 */
const Scraper = forwardRef<SafeWebViewHandle | WebView | null, ScraperProps>(
  ({ onMessage }, ref) => {
    const student_id = useUserStore(state => state.student_id) || '2023122691';
    const storedCredential = useUserStore(state => state.password) || '';

    const runFirst = storedCredential
      ? LOGIN_SCRAPER(student_id, storedCredential)
      : undefined;
    return (
      <View style={{ width: 0, height: 0 }}>
        {isHarmony ? (
          <SafeWebView
            ref={ref as ForwardedRef<SafeWebViewHandle>}
            style={{
              opacity: 0.99,
              minHeight: 1,
              flex: 1,
              overflow: 'hidden',
            }}
            source={{
              uri: 'https://grd.ccnu.edu.cn/yjsxt/xtgl/login_slogin.html',
            }}
            javaScriptEnabled
            injectedJavaScript={runFirst}
            injectedJavaScriptForMainFrameOnly={false}
            onMessage={event => {
              onMessage?.(event.nativeEvent.data);
            }}
            showOpenExternally={false}
          />
        ) : (
          <WebView
            ref={ref as ForwardedRef<WebView>}
            style={{
              opacity: 0.99,
              minHeight: 1,
              flex: 1,
              overflow: 'hidden',
            }}
            source={{
              uri: 'https://grd.ccnu.edu.cn/yjsxt/xtgl/login_slogin.html',
            }}
            javaScriptEnabled
            injectedJavaScript={runFirst}
            injectedJavaScriptForMainFrameOnly={false}
            onMessage={event => {
              onMessage?.(event.nativeEvent.data);
              // console.log(event.nativeEvent.data);
            }}
          />
        )}
      </View>
    );
  }
);

Scraper.displayName = 'Scraper';

export default Scraper;
