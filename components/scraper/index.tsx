import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';

import { ScraperProps } from '@/components/scraper/types';
import {
  scrapeCourse,
  scrapeGrade,
  scrapeLogin,
  semesterMap,
} from '@/constants/scraper';

const Scraper: React.FC<ScraperProps> = ({
  year = 2024,
  semester = semesterMap.first,
  scrape,
  onMessage,
}) => {
  const secretUserName = '2023122691';
  const secretPassword = 'zhao1638678192%';
  const webViewRef = useRef<WebView>(null);
  // const code = String(scrape(year, semester));
  useEffect(() => {
    setTimeout(() => {
      webViewRef.current &&
        webViewRef.current.injectJavaScript(scrape(year, semesterMap.first));
    }, 2000);
  }, [year, semester, scrape, webViewRef.current]);
  const runFirst = scrapeLogin(secretUserName, secretPassword);
  return (
    <View style={{ width: 200, height: 200 }}>
      <WebView
        ref={webViewRef}
        source={{
          uri: 'https://grd.ccnu.edu.cn/yjsxt/xtgl/login_slogin.html',
        }}
        javaScriptEnabled
        injectedJavaScript={runFirst}
        injectedJavaScriptForMainFrameOnly={false}
        onMessage={event => {
          onMessage(event);
          console.log(event.nativeEvent.data);
        }}
      />
    </View>
  );
};

export default Scraper;
