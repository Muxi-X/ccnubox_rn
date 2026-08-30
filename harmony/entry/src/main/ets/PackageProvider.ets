import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony';
import { createRNOHPackages as createRNOHPackagesAutolinking } from './RNOHPackagesFactory';
import { ExpoHarmonyPackage } from './expoHarmony/ExpoHarmonyPackage';
import { RNSkiaPackage } from '@react-native-oh-tpl/react-native-skia/ts';
import { RNJPushPackage } from '@react-native-ohos/jpush-react-native/ts';

export function getRNOHPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    ...createRNOHPackagesAutolinking(ctx),
    new RNSkiaPackage(ctx),
    new RNJPushPackage(ctx),
    new ExpoHarmonyPackage(ctx),
  ];
}
