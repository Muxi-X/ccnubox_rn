import { Platform } from 'react-native';

export const platformOS = Platform.OS as string;

export const isHarmony = platformOS === 'harmony';
export const isIOS = platformOS === 'ios';
export const isAndroid = platformOS === 'android';

export const defaultLayoutName = isIOS ? 'ios' : 'android';
