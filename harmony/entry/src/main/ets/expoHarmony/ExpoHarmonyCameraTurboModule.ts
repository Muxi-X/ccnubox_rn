import abilityAccessCtrl, { type Permissions } from '@ohos.abilityAccessCtrl';
import camera from '@ohos.multimedia.camera';
import cameraPicker from '@ohos.multimedia.cameraPicker';
import image from '@ohos.multimedia.image';
import { UITurboModule } from '@rnoh/react-native-openharmony/ts';

type PermissionResponse = {
  status: 'granted' | 'denied' | 'undetermined';
  granted: boolean;
  canAskAgain: boolean;
  expires: 'never';
};

type CameraCaptureResult = {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  exif: null;
};

type CameraRecordingResult = {
  uri: string;
  duration: number;
  fileSize: number | null;
  mimeType: string;
};

export class ExpoHarmonyCameraTurboModule extends UITurboModule {
  public static readonly NAME = 'ExpoHarmonyCamera';

  private readonly atManager = abilityAccessCtrl.createAtManager();
  private readonly previewStates = new Map<string, 'running' | 'paused'>();
  private readonly activeRecordings = new Map<string, CameraRecordingResult>();

  getConstants(): Record<string, never> {
    return {};
  }

  async getCameraPermissionStatus(): Promise<PermissionResponse> {
    return this.getPermissionResponse('ohos.permission.CAMERA');
  }

  async requestCameraPermission(): Promise<PermissionResponse> {
    return this.requestPermissionResponse('ohos.permission.CAMERA');
  }

  async getMicrophonePermissionStatus(): Promise<PermissionResponse> {
    return this.getPermissionResponse('ohos.permission.MICROPHONE');
  }

  async requestMicrophonePermission(): Promise<PermissionResponse> {
    return this.requestPermissionResponse('ohos.permission.MICROPHONE');
  }

  async createPreview(options?: { viewId?: string }): Promise<{ viewId: string; state: 'running' }> {
    const viewId = typeof options?.viewId === 'string' && options.viewId.length > 0
      ? options.viewId
      : 'expo-harmony-camera-preview';
    this.previewStates.set(viewId, 'running');
    return {
      viewId,
      state: 'running',
    };
  }

  async disposePreview(options?: { viewId?: string }): Promise<void> {
    if (typeof options?.viewId === 'string') {
      this.previewStates.delete(options.viewId);
      this.activeRecordings.delete(options.viewId);
    }
  }

  async pausePreview(options?: { viewId?: string }): Promise<{ paused: boolean }> {
    if (typeof options?.viewId === 'string') {
      this.previewStates.set(options.viewId, 'paused');
    }
    return {
      paused: true,
    };
  }

  async resumePreview(options?: { viewId?: string }): Promise<{ paused: boolean }> {
    if (typeof options?.viewId === 'string') {
      this.previewStates.set(options.viewId, 'running');
    }
    return {
      paused: false,
    };
  }

  async takePicture(options?: { cameraType?: string; viewId?: string }): Promise<CameraCaptureResult> {
    const profile = new cameraPicker.PickerProfile();
    profile.cameraPosition =
      options?.cameraType === 'front'
        ? camera.CameraPosition.CAMERA_POSITION_FRONT
        : camera.CameraPosition.CAMERA_POSITION_BACK;

    const result = await cameraPicker.pick(
      this.ctx.uiAbilityContext,
      [cameraPicker.PickerMediaType.PHOTO],
      profile,
    );

    if (!result || typeof result.resultUri !== 'string' || result.resultUri.length === 0) {
      throw new Error('Camera capture was canceled.');
    }

    const imageSize = await this.getImageSize(result.resultUri);

    return {
      uri: result.resultUri,
      width: imageSize.width,
      height: imageSize.height,
      exif: null,
    };
  }

  async startRecording(options?: { viewId?: string; cameraType?: string }): Promise<CameraRecordingResult> {
    const microphonePermission = await this.requestPermissionResponse('ohos.permission.MICROPHONE');
    if (!microphonePermission.granted) {
      throw new Error('Microphone permission is required for camera recording.');
    }
    const profile = new cameraPicker.PickerProfile();
    profile.cameraPosition =
      options?.cameraType === 'front'
        ? camera.CameraPosition.CAMERA_POSITION_FRONT
        : camera.CameraPosition.CAMERA_POSITION_BACK;

    const result = await cameraPicker.pick(
      this.ctx.uiAbilityContext,
      [cameraPicker.PickerMediaType.VIDEO],
      profile,
    );

    if (!result || typeof result.resultUri !== 'string' || result.resultUri.length === 0) {
      throw new Error('Camera recording was canceled.');
    }

    const recording = {
      uri: result.resultUri,
      duration: 0,
      fileSize: null,
      mimeType: 'video/mp4',
    };

    if (typeof options?.viewId === 'string') {
      this.activeRecordings.set(options.viewId, recording);
    }

    return recording;
  }

  async stopRecording(options?: { viewId?: string }): Promise<CameraRecordingResult | null> {
    if (typeof options?.viewId === 'string') {
      const recording = this.activeRecordings.get(options.viewId) ?? null;
      this.activeRecordings.delete(options.viewId);
      return recording;
    }

    return null;
  }

  async toggleRecording(options?: { viewId?: string; cameraType?: string }): Promise<CameraRecordingResult | null> {
    if (typeof options?.viewId === 'string' && this.activeRecordings.has(options.viewId)) {
      return this.stopRecording(options);
    }

    return this.startRecording(options);
  }

  private async getPermissionResponse(permissionName: Permissions): Promise<PermissionResponse> {
    const atManagerWithSelfStatus = this.atManager as abilityAccessCtrl.AtManager & {
      getSelfPermissionStatus?: (permission: Permissions) => abilityAccessCtrl.PermissionStatus;
    };
    const permissionStatus =
      typeof atManagerWithSelfStatus.getSelfPermissionStatus === 'function'
        ? atManagerWithSelfStatus.getSelfPermissionStatus(permissionName)
        : this.atManager.checkAccessTokenSync(
            this.ctx.uiAbilityContext.abilityInfo.applicationInfo.accessTokenId,
            permissionName,
          ) === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED
          ? abilityAccessCtrl.PermissionStatus.GRANTED
          : abilityAccessCtrl.PermissionStatus.NOT_DETERMINED;

    return this.createPermissionResponse(permissionStatus);
  }

  private async requestPermissionResponse(permissionName: Permissions): Promise<PermissionResponse> {
    await this.atManager.requestPermissionsFromUser(this.ctx.uiAbilityContext, [permissionName]);
    return this.getPermissionResponse(permissionName);
  }

  private createPermissionResponse(
    permissionStatus: abilityAccessCtrl.PermissionStatus,
  ): PermissionResponse {
    const granted = permissionStatus === abilityAccessCtrl.PermissionStatus.GRANTED;
    const denied =
      permissionStatus === abilityAccessCtrl.PermissionStatus.DENIED ||
      permissionStatus === abilityAccessCtrl.PermissionStatus.RESTRICTED ||
      permissionStatus === abilityAccessCtrl.PermissionStatus.INVALID;

    return {
      status: granted ? 'granted' : denied ? 'denied' : 'undetermined',
      granted,
      canAskAgain: !denied,
      expires: 'never',
    };
  }

  private async getImageSize(assetUri: string): Promise<{ width: number; height: number }> {
    let imageSource: image.ImageSource | null = null;

    try {
      imageSource = image.createImageSource(assetUri);
      const imageInfo = await imageSource.getImageInfo();
      return {
        width: Number(imageInfo.size?.width ?? 0),
        height: Number(imageInfo.size?.height ?? 0),
      };
    } catch (_error) {
      return {
        width: 0,
        height: 0,
      };
    } finally {
      if (imageSource) {
        try {
          await imageSource.release();
        } catch (_error) {
          // Ignore cleanup errors from ImageSource release.
        }
      }
    }
  }
}
