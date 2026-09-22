import * as Clipboard from 'expo-clipboard';

import Toast from '@/components/toast';
/** 用户复制文字
 * 成功后 Toast 展示复制成功
 * @param text 要复制的文字
 */
const handleCopy = (text: string) => {
  Clipboard.setStringAsync(text).then(() => {
    Toast.success('已复制到剪贴板');
  });
};
export default handleCopy;
