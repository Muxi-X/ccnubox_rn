import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony';
import { createRNOHPackages as createRNOHPackagesAutolinking } from './RNOHPackagesFactory';
import { ExpoHarmonyPackage } from './expoHarmony/ExpoHarmonyPackage';

export function getRNOHPackages(ctx: RNPackageContext): RNPackage[] {
  return [...createRNOHPackagesAutolinking(ctx), new ExpoHarmonyPackage(ctx)];
}
