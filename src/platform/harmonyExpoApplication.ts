import { TurboModule, TurboModuleRegistry } from 'react-native';

interface ExpoHarmonySystemModule extends TurboModule {
  getConstants(): {
    applicationId: string;
    nativeApplicationVersion: string;
    nativeBuildVersion: string;
  };
}

const nativeModule =
  TurboModuleRegistry.getEnforcing<ExpoHarmonySystemModule>(
    'ExpoHarmonySystem'
  );
const constants = nativeModule.getConstants();

export const applicationId = constants.applicationId;
export const applicationName = '华师匣子';
export const nativeApplicationVersion = constants.nativeApplicationVersion;
export const nativeBuildVersion = constants.nativeBuildVersion;
