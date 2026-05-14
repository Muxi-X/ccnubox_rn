import { platformCapabilities } from './capabilities';

let expoHapticsModule: typeof import('expo-haptics') | null | undefined;

const getExpoHapticsModule = () => {
  if (!platformCapabilities.haptics) {
    return null;
  }

  if (expoHapticsModule === undefined) {
    expoHapticsModule =
      require('expo-haptics') as typeof import('expo-haptics');
  }

  return expoHapticsModule;
};

export const ImpactFeedbackStyle = {
  Light: 'light',
} as const;

export const impactAsync = async (_style: string) => {
  const haptics = getExpoHapticsModule();
  if (!haptics) {
    return;
  }

  return haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
};

export const selectionAsync = async () => {
  const haptics = getExpoHapticsModule();
  if (!haptics) {
    return;
  }

  return haptics.selectionAsync();
};
