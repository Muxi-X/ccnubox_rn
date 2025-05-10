import * as Clipboard from 'expo-clipboard';

import Modal from '@/components/modal';
/** 用户复制文字
 * 成功后 Modal展示复制成功
 * @param text 要复制的文字
 */
const handleCopy = (text: string) => {
  Clipboard.setStringAsync(text).then(() => {
    Modal.show({
      title: '复制成功',
      children: '文本已复制到剪贴板',
      mode: 'middle',
      showCancel: false,
    });
  });
  //console.log('复制文本为：' + text);
};
export default handleCopy;
