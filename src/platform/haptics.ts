import { platformCapabilities } from './capabilities';

let expoHapticsModule: typeof import('expo-haptics') | null | undefined;

const getExpoHapticsModule = () => {
  if (!platformCapabilities.haptics) {
    return null;
  }

  if (expoHapticsModule === undefined) {
    try {
      expoHapticsModule =
        require('expo-haptics') as typeof import('expo-haptics');
    } catch {
      expoHapticsModule = null;
    }
  }

  return expoHapticsModule;
};

export const ImpactFeedbackStyle = {
  Light: 'light',
} as const;

export const impactAsync = async (style: string) => {
  const haptics = getExpoHapticsModule();
  if (!haptics) {
    return;
  }

  const nativeStyle =
    style === ImpactFeedbackStyle.Light
      ? haptics.ImpactFeedbackStyle.Light
      : haptics.ImpactFeedbackStyle.Light;

  return haptics.impactAsync(nativeStyle);
};

export const selectionAsync = async () => {
  const haptics = getExpoHapticsModule();
  if (!haptics) {
    return;
  }

  return haptics.selectionAsync();
};
