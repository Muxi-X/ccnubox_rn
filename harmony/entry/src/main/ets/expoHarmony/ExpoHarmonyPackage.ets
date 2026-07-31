import type {
  AnyThreadTurboModule,
  AnyThreadTurboModuleContext,
  UITurboModule,
  UITurboModuleContext,
} from '@rnoh/react-native-openharmony';
import {
  RNOHPackage,
} from '@rnoh/react-native-openharmony';
import { ExpoHarmonyFileSystemTurboModule } from './ExpoHarmonyFileSystemTurboModule';
import { ExpoHarmonyImagePickerTurboModule } from './ExpoHarmonyImagePickerTurboModule';
import { ExpoHarmonyLocationTurboModule } from './ExpoHarmonyLocationTurboModule';
import { ExpoHarmonyCameraTurboModule } from './ExpoHarmonyCameraTurboModule';

export class ExpoHarmonyPackage extends RNOHPackage {
  override getAnyThreadTurboModuleFactoryByNameMap(): Map<
    string,
    (ctx: AnyThreadTurboModuleContext) => AnyThreadTurboModule | null
  > {
    return new Map<string, (ctx: AnyThreadTurboModuleContext) => AnyThreadTurboModule | null>()
      .set(
        ExpoHarmonyFileSystemTurboModule.NAME,
        (ctx) => new ExpoHarmonyFileSystemTurboModule(ctx),
      )
      .set(
        ExpoHarmonyLocationTurboModule.NAME,
        (ctx) => new ExpoHarmonyLocationTurboModule(ctx),
      );
  }

  override getUITurboModuleFactoryByNameMap(): Map<
    string,
    (ctx: UITurboModuleContext) => UITurboModule | null
  > {
    return new Map<string, (ctx: UITurboModuleContext) => UITurboModule | null>()
      .set(
        ExpoHarmonyImagePickerTurboModule.NAME,
        (ctx) => new ExpoHarmonyImagePickerTurboModule(ctx),
      )
      .set(
        ExpoHarmonyCameraTurboModule.NAME,
        (ctx) => new ExpoHarmonyCameraTurboModule(ctx),
      );
  }

  override getDebugName() {
    return 'expo-harmony';
  }
}
