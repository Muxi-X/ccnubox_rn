import { WebViewMessageEvent } from 'react-native-webview';

import { semesterMap } from '@/constants/scraper';

export interface ScraperProps {
  /* 学年 */
  year?: number;
  /* 学期 */
  semester?: semesterMap;
  /* 爬取函数 */
  scrape: (year: number, semester: semesterMap) => string;
  /* 消息监听，与 webview 通信 */
  onMessage: (event: WebViewMessageEvent) => void;
}
