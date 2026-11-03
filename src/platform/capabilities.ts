import { defaultLayoutName, isAndroid, isHarmony, isIOS } from './runtime';

export const platformCapabilities = {
  attachmentUpload: true,
  badgeSync: true,
  courseExport: true,
  edgeToEdge: true,
  haptics: true,
  inAppBrowser: true,
  liveActivity: isIOS && !isHarmony,
  nativePdf: true,
  push: true,
  secureStorageBackend: isHarmony ? 'asset-store' : 'secure-store',
  webView: true,
  widgetSync: isAndroid || isHarmony,
} as const;

export const isCapabilityEnabled = <
  TKey extends keyof typeof platformCapabilities,
>(
  capability: TKey
) => {
  return platformCapabilities[capability];
};

export { defaultLayoutName, isHarmony };
