// @ts-expect-error The Harmony fork declares its API under the upstream module name.
import InAppBrowser from '@react-native-ohos/react-native-inappbrowser-reborn';
import { Linking } from 'react-native';

type BrowserResult = {
  type: 'cancel' | 'dismiss' | 'opened';
};

export const openBrowserAsync = async (url: string): Promise<BrowserResult> => {
  if (await InAppBrowser.isAvailable()) {
    return InAppBrowser.open(url);
  }

  await Linking.openURL(url);
  return { type: 'opened' };
};
