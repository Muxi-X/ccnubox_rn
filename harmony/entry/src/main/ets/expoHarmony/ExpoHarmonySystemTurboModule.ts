import bundleManager from '@ohos.bundle.bundleManager';
import vibrator from '@ohos.vibrator';
import { UITurboModule } from '@rnoh/react-native-openharmony/ts';
import { consumeInitialJPushOpened } from './JPushColdStartStore';
import { saveAndRefreshCourseWidgets } from '../widget/CourseWidgetStore';

export class ExpoHarmonySystemTurboModule extends UITurboModule {
  public static readonly NAME = 'ExpoHarmonySystem';

  getConstants(): {
    applicationId: string;
    nativeApplicationVersion: string;
    nativeBuildVersion: string;
  } {
    const bundleInfo = bundleManager.getBundleInfoForSelfSync(
      bundleManager.BundleFlag.GET_BUNDLE_INFO_DEFAULT
    );
    return {
      applicationId: bundleInfo.name,
      nativeApplicationVersion: bundleInfo.versionName,
      nativeBuildVersion: bundleInfo.versionCode.toString(),
    };
  }

  async triggerHaptic(style: string): Promise<void> {
    await vibrator.startVibration(
      { type: 'time', duration: style === 'selection' ? 8 : 15 },
      { usage: 'touch' }
    );
  }

  async consumeInitialNotificationOpened(): Promise<string | null> {
    return consumeInitialJPushOpened();
  }

  async updateCourseWidget(payload: string): Promise<void> {
    await saveAndRefreshCourseWidgets(this.ctx.uiAbilityContext, payload);
  }
}
