import React, { forwardRef } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';

import { ScraperProps } from '@/components/scraper/types';
import { scrapeLogin } from '@/constants/scraper';

/**
 * 爬虫组件，用于爬取研究生课表、成绩
 * 位于全局，通过 ref 调用
 * @example
 */
const Scraper = forwardRef<WebView | null, ScraperProps>(
  ({ onMessage }, ref) => {
    const secretUserName = '2023122691';
    const secretPassword = 'zhao1638678192%';

    const runFirst = scrapeLogin(secretUserName, secretPassword);

    return (
      <View style={{ width: 0, height: 0 }}>
        <WebView
          ref={ref}
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
      </View>
    );
  }
);

Scraper.displayName = 'Scraper';

export default Scraper;
