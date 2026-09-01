import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony';
import { createRNOHPackages as createRNOHPackagesAutolinking } from './RNOHPackagesFactory';
import { ExpoHarmonyPackage } from './expoHarmony/ExpoHarmonyPackage';
import { RNSkiaPackage } from '@react-native-oh-tpl/react-native-skia/ts';
import { RNJPushPackage } from '@react-native-ohos/jpush-react-native/ts';
import BlobUtilPackage from '@react-native-ohos/react-native-blob-util';
import { RNInAppBrowserPackage } from '@react-native-ohos/react-native-inappbrowser-reborn';
import LinearGradientPackage from '@react-native-ohos/react-native-linear-gradient';
import PdfViewPackage from '@react-native-ohos/react-native-pdf';

export function getRNOHPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    ...createRNOHPackagesAutolinking(ctx),
    new RNSkiaPackage(ctx),
    new RNJPushPackage(ctx),
    new BlobUtilPackage(ctx),
    new RNInAppBrowserPackage(ctx),
    new LinearGradientPackage(ctx),
    new PdfViewPackage(ctx),
    new ExpoHarmonyPackage(ctx),
  ];
}
