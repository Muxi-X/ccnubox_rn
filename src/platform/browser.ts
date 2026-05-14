import { Linking } from 'react-native';

import { platformCapabilities } from './capabilities';

let webBrowserModule: typeof import('expo-web-browser') | null | undefined;

const getWebBrowserModule = () => {
  if (!platformCapabilities.inAppBrowser) {
    return null;
  }

  if (webBrowserModule === undefined) {
    webBrowserModule =
      require('expo-web-browser') as typeof import('expo-web-browser');
  }

  return webBrowserModule;
};

type BrowserResult = {
  type: string;
};

export const openBrowserAsync = async (url: string): Promise<BrowserResult> => {
  const webBrowser = getWebBrowserModule();

  if (webBrowser) {
    return webBrowser.openBrowserAsync(url);
  }

  await Linking.openURL(url);

  return {
    type: 'opened',
  } as BrowserResult;
};
