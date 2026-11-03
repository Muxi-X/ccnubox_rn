import deviceInfo from '@ohos.deviceInfo';
import hidebug from '@ohos.hidebug';
import vibrator from '@ohos.vibrator';
import { AnyThreadTurboModule } from '@rnoh/react-native-openharmony/ts';

type DeviceConstants = {
  brand: string;
  manufacturer: string;
  modelName: string;
  modelId: string;
  productName: string;
  deviceName: string;
  deviceType: number;
  isDevice: boolean;
  osName: string;
  osVersion: string;
  osBuildId: string;
  osInternalBuildId: string;
  platformApiLevel: number;
  totalMemory: number | null;
  supportedCpuArchitectures: string[];
};

export class ExpoHarmonyAppFoundationTurboModule extends AnyThreadTurboModule {
  public static readonly NAME = 'ExpoHarmonyAppFoundation';

  getConstants(): DeviceConstants {
    const types: Record<string, number> = { phone: 1, default: 1, tablet: 2, '2in1': 3, pc: 3, tv: 4 };
    let memory: number | null = null;
    try { memory = Number(hidebug.getSystemMemInfo().totalMem) * 1024; } catch (_) {}
    return {
      brand: deviceInfo.brand,
      manufacturer: deviceInfo.manufacture,
      modelName: deviceInfo.productModel,
      modelId: deviceInfo.hardwareModel,
      productName: deviceInfo.productSeries,
      deviceName: deviceInfo.marketName,
      deviceType: types[deviceInfo.deviceType] ?? 0,
      isDevice: !/emulator|simulator/i.test(deviceInfo.productModel),
      osName: deviceInfo.osFullName.split('-')[0],
      osVersion: deviceInfo.majorVersion + '.' + deviceInfo.seniorVersion + '.' + deviceInfo.featureVersion,
      osBuildId: deviceInfo.displayVersion,
      osInternalBuildId: String(deviceInfo.buildVersion),
      platformApiLevel: deviceInfo.sdkApiVersion,
      totalMemory: memory,
      supportedCpuArchitectures: deviceInfo.abiList.split(',').map((abi: string) => abi.trim()).filter((abi: string) => abi.length > 0),
    };
  }

  async triggerHaptic(style: string): Promise<void> {
    const durations: Record<string, number> = { selection: 8, light: 10, medium: 20, heavy: 35, rigid: 15, soft: 25, success: 30, warning: 50, error: 75 };
    const duration = durations[style];
    if (duration === undefined) throw new Error('Invalid haptic style.');
    await vibrator.startVibration({ type: 'time', duration }, { usage: 'touch' });
  }
}
