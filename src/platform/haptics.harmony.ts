import { TurboModule, TurboModuleRegistry } from 'react-native';

export const ImpactFeedbackStyle = {
  Light: 'light',
} as const;

interface ExpoHarmonySystemModule extends TurboModule {
  triggerHaptic(_style: string): Promise<void>;
}

const nativeModule =
  TurboModuleRegistry.getEnforcing<ExpoHarmonySystemModule>(
    'ExpoHarmonySystem'
  );

export const impactAsync = async (style: string) => {
  await nativeModule.triggerHaptic(style);
};

export const selectionAsync = async () => {
  await nativeModule.triggerHaptic('selection');
};
