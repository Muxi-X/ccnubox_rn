import { Linking } from 'react-native';

import { platformCapabilities } from './capabilities';

let webBrowserModule: typeof import('expo-web-browser') | null | undefined;

const getWebBrowserModule = () => {
  if (!platformCapabilities.inAppBrowser) {
    return null;
  }

  if (webBrowserModule === undefined) {
    try {
      webBrowserModule =
        require('expo-web-browser') as typeof import('expo-web-browser');
    } catch {
      webBrowserModule = null;
    }
  }

  return webBrowserModule;
};

type BrowserResult = {
  type: 'cancel' | 'dismiss' | 'locked' | 'opened';
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
