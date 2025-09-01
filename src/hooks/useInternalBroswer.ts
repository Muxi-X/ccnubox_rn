import { useRouter } from 'expo-router';

/**
 * 在内部浏览器打开链接
 * @example
 * const openInApp = useInternalBroswer();
 * openInApp('https://www.baidu.com');
 */
export function useInternalBroswer() {
  const router = useRouter();
  return (url: string) =>
    router.navigate(`/(mainPage)/webview?link=${btoa(url)}`);
}
