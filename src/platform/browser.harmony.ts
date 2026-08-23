import { Linking } from 'react-native';

type BrowserResult = {
  type: 'opened';
};

export const openBrowserAsync = async (url: string): Promise<BrowserResult> => {
  await Linking.openURL(url);
  return { type: 'opened' };
};
