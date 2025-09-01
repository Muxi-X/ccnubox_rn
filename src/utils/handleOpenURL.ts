import { Linking } from 'react-native';

import Toast from '@/components/toast';

/**
 * 打开URL链接，处理打开失败的情况
 * @param {string} url 要打开的URL，支持自定义scheme（如alipays://、weixin://等）
 * @param {string} appName 应用名称，用于错误提示
 * @example
 * // 打开支付宝
 * handleOpenURL('alipays://platformapi/startapp?appId=xxx', '支付宝');
 * // 打开微信
 * handleOpenURL('weixin://dl/business/?appid=xxx', '微信');
 */
export const handleOpenURL = async (url: string, appName: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Toast.show({ text: `无法打开${appName}，请确保已安装该应用` });
      return;
    }
    await Linking.openURL(url);
  } catch (error) {
    //console.error('打开链接时出错:', error);
    if (error instanceof Error) {
      if (error.message.includes('scheme')) {
        Toast.show({ text: `请先安装${appName}` });
      } else {
        Toast.show({ text: '打开链接失败，请稍后重试' });
      }
    }
  }
};

/**
 * 使用指定的电话号码打开拨号器。
 *
 * @param number - 要拨打的电话号码，应为电话号码的字符串。
 */
export const openPhoneNumber = (number: string) => {
  handleOpenURL(`tel:${number}`, '电话');
};

/**
 * 使用指定的URL打开浏览器。
 *
 * @param url - 要打开的URL，应为URL的字符串。
 */
export const openBrowser = (url: string) => {
  handleOpenURL(url, '浏览器');
};
