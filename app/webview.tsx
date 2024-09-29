import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { WebViewMessageEvent } from 'react-native-webview';

import Scraper from '@/components/scraper';
import { scrapeCourse, semesterMap } from '@/constants/scraper';

const MyWebView = () => {
  const [info, setInfo] = useState('');
  const handleMessage = (event: WebViewMessageEvent) => {
    setInfo(event.nativeEvent.data);
  };
  return (
    <View style={{ flex: 1 }}>
      <Scraper
        onMessage={handleMessage}
        scrape={scrapeCourse}
        semester={semesterMap.first}
        year={2024}
      ></Scraper>
      <Text>Cookie: {JSON.stringify(info)}</Text>
    </View>
  );
};

export default MyWebView;
