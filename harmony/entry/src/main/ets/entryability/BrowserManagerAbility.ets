import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
import { RNInAppBrowserModule } from '@react-native-ohos/react-native-inappbrowser-reborn/ts';

export default class BrowserManagerAbility extends UIAbility {
  onCreate(_want: Want, _launchParam: AbilityConstant.LaunchParam): void {
    RNInAppBrowserModule.start();
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    windowStage.loadContent('pages/BrowserManagerPage');
  }
}
