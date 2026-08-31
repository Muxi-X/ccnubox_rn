import { AbilityConstant, Want } from '@kit.AbilityKit';
import { RNAbility } from '@rnoh/react-native-openharmony';
import { installJPushColdStartCapture } from '../expoHarmony/JPushColdStartStore';

export default class EntryAbility extends RNAbility {
  override onCreate(
    want: Want,
    launchParam?: AbilityConstant.LaunchParam
  ): void {
    installJPushColdStartCapture(this.context.getApplicationContext());
    super.onCreate(want, launchParam);
  }

  override getPagePath() {
    return 'pages/Index';
  }

  override getRNOHWorkerScriptUrl() {
    return 'entry/ets/workers/RNOHWorker.ets';
  }
}
