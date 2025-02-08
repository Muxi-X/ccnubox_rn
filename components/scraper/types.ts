export interface ScraperProps {
  /** 消息监听，与 webview 通信 */
  onMessage: (event: string) => void;
}
