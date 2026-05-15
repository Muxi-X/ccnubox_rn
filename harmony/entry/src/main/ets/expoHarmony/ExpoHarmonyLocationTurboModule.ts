import abilityAccessCtrl, { type Permissions } from '@ohos.abilityAccessCtrl';
import geoLocationManager from '@ohos.geoLocationManager';
import { sensor } from '@kit.SensorServiceKit';
import { AnyThreadTurboModule } from '@rnoh/react-native-openharmony/ts';

type PermissionResponse = {
  status: 'granted' | 'denied' | 'undetermined';
  granted: boolean;
  canAskAgain: boolean;
  expires: 'never';
  android: {
    accuracy: 'fine' | 'coarse' | 'none';
  };
};

type ExpoLocationObject = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
  mocked: false;
};

type ProviderStatus = {
  locationServicesEnabled: boolean;
  backgroundModeEnabled: boolean;
  gpsAvailable: boolean;
  networkAvailable: boolean;
  passiveAvailable: boolean;
};

type ReverseGeocodeResult = {
  city: string | null;
  district: string | null;
  streetNumber: string | null;
  street: string | null;
  region: string | null;
  subregion: string | null;
  country: string | null;
  postalCode: string | null;
  name: string | null;
  isoCountryCode: string | null;
  timezone: null;
  formattedAddress: string | null;
};

type GeocodeResult = {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
};

type HeadingObject = {
  magHeading: number;
  trueHeading: number | null;
  accuracy: number;
};

export class ExpoHarmonyLocationTurboModule extends AnyThreadTurboModule {
  public static readonly NAME = 'ExpoHarmonyLocation';

  private readonly atManager = abilityAccessCtrl.createAtManager();
  private nextWatchId = 1;

  getConstants(): Record<string, never> {
    return {};
  }

  async getForegroundPermissionStatus(): Promise<PermissionResponse> {
    return this.getLocationPermissionResponse();
  }

  async requestForegroundPermission(): Promise<PermissionResponse> {
    return this.requestLocationPermissionResponse();
  }

  async getBackgroundPermissionStatus(): Promise<PermissionResponse> {
    const backgroundStatus = this.resolvePermissionStatus('ohos.permission.LOCATION_IN_BACKGROUND');
    return this.buildBackgroundPermissionResponse(backgroundStatus);
  }

  async requestBackgroundPermission(): Promise<PermissionResponse> {
    await this.atManager.requestPermissionsFromUser(this.ctx.uiAbilityContext, [
      'ohos.permission.LOCATION_IN_BACKGROUND',
    ]);
    return this.getBackgroundPermissionStatus();
  }

  async hasServicesEnabled(): Promise<boolean> {
    return geoLocationManager.isLocationEnabled();
  }

  async getProviderStatus(): Promise<ProviderStatus> {
    const locationServicesEnabled = geoLocationManager.isLocationEnabled();

    return {
      locationServicesEnabled,
      backgroundModeEnabled:
        this.resolvePermissionStatus('ohos.permission.LOCATION_IN_BACKGROUND') ===
        abilityAccessCtrl.PermissionStatus.GRANTED,
      gpsAvailable: locationServicesEnabled,
      networkAvailable: locationServicesEnabled,
      passiveAvailable: locationServicesEnabled,
    };
  }

  async getCurrentPosition(options?: { accuracy?: number }): Promise<ExpoLocationObject> {
    const location = await geoLocationManager.getCurrentLocation(
      this.createCurrentLocationRequest(options?.accuracy),
    );
    return this.normalizeLocation(location);
  }

  async getLastKnownPosition(_options?: Record<string, unknown>): Promise<ExpoLocationObject | null> {
    try {
      const location = geoLocationManager.getLastLocation();
      return this.hasCoordinates(location) ? this.normalizeLocation(location) : null;
    } catch (_error) {
      return null;
    }
  }

  async geocode(address: string): Promise<GeocodeResult[]> {
    const addresses = await geoLocationManager.getAddressesFromLocationName({
      description: address,
      locale: 'en-US',
      maxItems: 5,
    });

    return addresses.map((addressEntry) => ({
      latitude: Number(addressEntry.latitude ?? 0),
      longitude: Number(addressEntry.longitude ?? 0),
    }));
  }

  async reverseGeocode(location: { latitude: number; longitude: number }): Promise<ReverseGeocodeResult[]> {
    const addresses = await geoLocationManager.getAddressesFromLocation({
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      locale: 'en-US',
      maxItems: 5,
    });

    return addresses.map((addressEntry) => ({
      city: this.readAddressString(addressEntry, ['locality']),
      district: this.readAddressString(addressEntry, ['subLocality']),
      streetNumber: this.readAddressString(addressEntry, ['subThoroughfare', 'streetNumber']),
      street: this.readAddressString(addressEntry, ['thoroughfare', 'street']),
      region: this.readAddressString(addressEntry, ['administrativeArea', 'region']),
      subregion: this.readAddressString(addressEntry, ['subAdministrativeArea', 'subregion']),
      country: this.readAddressString(addressEntry, ['countryName', 'country']),
      postalCode: this.readAddressString(addressEntry, ['postalCode']),
      name: this.readAddressString(addressEntry, ['placeName', 'name']),
      isoCountryCode: this.readAddressString(addressEntry, ['countryCode', 'isoCountryCode']),
      timezone: null,
      formattedAddress: this.readAddressString(addressEntry, ['addressUrl']) ?? this.joinAddressDescriptions(addressEntry),
    }));
  }

  async startWatchPosition(
    options?: { accuracy?: number },
    _listenerConfig?: Record<string, unknown>,
  ): Promise<{ watchId: number; initialLocation: ExpoLocationObject | null }> {
    const watchId = this.nextWatchId++;
    return {
      watchId,
      initialLocation: await this.getLastKnownPosition(options ?? {}),
    };
  }

  async stopWatchPosition(_watchId: number): Promise<void> {
    return;
  }

  async getHeading(): Promise<HeadingObject> {
    return this.readHeadingSnapshot();
  }

  async startWatchHeading(
    _listenerConfig?: Record<string, unknown>,
  ): Promise<{ watchId: number; initialHeading: HeadingObject }> {
    const watchId = this.nextWatchId++;
    return {
      watchId,
      initialHeading: await this.getHeading(),
    };
  }

  async stopWatchHeading(_watchId: number): Promise<void> {
    return;
  }

  private async getLocationPermissionResponse(): Promise<PermissionResponse> {
    const approximateStatus = this.resolvePermissionStatus('ohos.permission.APPROXIMATELY_LOCATION');
    const preciseStatus = this.resolvePermissionStatus('ohos.permission.LOCATION');

    return this.buildPermissionResponse(approximateStatus, preciseStatus);
  }

  private async buildBackgroundPermissionResponse(
    backgroundStatus: abilityAccessCtrl.PermissionStatus,
  ): Promise<PermissionResponse> {
    const foregroundPermission = await this.getLocationPermissionResponse();
    const granted = backgroundStatus === abilityAccessCtrl.PermissionStatus.GRANTED;
    const denied =
      backgroundStatus === abilityAccessCtrl.PermissionStatus.DENIED ||
      backgroundStatus === abilityAccessCtrl.PermissionStatus.RESTRICTED ||
      backgroundStatus === abilityAccessCtrl.PermissionStatus.INVALID;

    return {
      ...foregroundPermission,
      status: granted ? 'granted' : denied ? 'denied' : 'undetermined',
      granted,
      canAskAgain: !denied,
    };
  }

  private async requestLocationPermissionResponse(): Promise<PermissionResponse> {
    await this.atManager.requestPermissionsFromUser(this.ctx.uiAbilityContext, [
      'ohos.permission.APPROXIMATELY_LOCATION',
      'ohos.permission.LOCATION',
    ]);

    return this.getLocationPermissionResponse();
  }

  private resolvePermissionStatus(permissionName: Permissions): abilityAccessCtrl.PermissionStatus {
    const atManagerWithSelfStatus = this.atManager as abilityAccessCtrl.AtManager & {
      getSelfPermissionStatus?: (permission: Permissions) => abilityAccessCtrl.PermissionStatus;
    };

    if (typeof atManagerWithSelfStatus.getSelfPermissionStatus === 'function') {
      return atManagerWithSelfStatus.getSelfPermissionStatus(permissionName);
    }

    const accessTokenId = this.ctx.uiAbilityContext.abilityInfo.applicationInfo.accessTokenId;
    const grantStatus = this.atManager.checkAccessTokenSync(accessTokenId, permissionName);

    return grantStatus === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED
      ? abilityAccessCtrl.PermissionStatus.GRANTED
      : abilityAccessCtrl.PermissionStatus.NOT_DETERMINED;
  }

  private buildPermissionResponse(
    approximateStatus: abilityAccessCtrl.PermissionStatus,
    preciseStatus: abilityAccessCtrl.PermissionStatus,
  ): PermissionResponse {
    const coarseGranted = approximateStatus === abilityAccessCtrl.PermissionStatus.GRANTED;
    const fineGranted = preciseStatus === abilityAccessCtrl.PermissionStatus.GRANTED;
    const granted = coarseGranted || fineGranted;
    const denied =
      (approximateStatus === abilityAccessCtrl.PermissionStatus.DENIED ||
        approximateStatus === abilityAccessCtrl.PermissionStatus.RESTRICTED ||
        approximateStatus === abilityAccessCtrl.PermissionStatus.INVALID) &&
      (preciseStatus === abilityAccessCtrl.PermissionStatus.DENIED ||
        preciseStatus === abilityAccessCtrl.PermissionStatus.RESTRICTED ||
        preciseStatus === abilityAccessCtrl.PermissionStatus.INVALID);

    return {
      status: granted ? 'granted' : denied ? 'denied' : 'undetermined',
      granted,
      canAskAgain: !denied,
      expires: 'never',
      android: {
        accuracy: fineGranted ? 'fine' : coarseGranted ? 'coarse' : 'none',
      },
    };
  }

  private createCurrentLocationRequest(accuracy?: number): geoLocationManager.CurrentLocationRequest {
    if (typeof accuracy === 'number' && accuracy >= 4) {
      return {
        priority: geoLocationManager.LocationRequestPriority.ACCURACY,
      };
    }

    if (typeof accuracy === 'number' && accuracy <= 2) {
      return {
        priority: geoLocationManager.LocationRequestPriority.LOW_POWER,
      };
    }

    return {
      priority: geoLocationManager.LocationRequestPriority.FIRST_FIX,
    };
  }

  private hasCoordinates(location: geoLocationManager.Location | null | undefined): location is geoLocationManager.Location {
    return (
      !!location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number'
    );
  }

  private normalizeLocation(location: geoLocationManager.Location): ExpoLocationObject {
    return {
      coords: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        altitude: typeof location.altitude === 'number' ? location.altitude : null,
        accuracy: typeof location.accuracy === 'number' ? location.accuracy : null,
        altitudeAccuracy: null,
        heading: typeof location.direction === 'number' ? location.direction : null,
        speed: typeof location.speed === 'number' ? location.speed : null,
      },
      timestamp: Number(location.timeStamp ?? Date.now()),
      mocked: false,
    };
  }

  private async readHeadingSnapshot(): Promise<HeadingObject> {
    return new Promise((resolve) => {
      let settled = false;
      const fallbackHeading = {
        magHeading: 0,
        trueHeading: null,
        accuracy: 0,
      };
      const resolveOnce = (heading: HeadingObject) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeout);
        resolve(heading);
      };
      const timeout = setTimeout(() => resolveOnce(fallbackHeading), 1000);

      try {
        const sensorApi = sensor as unknown as {
          once?: (sensorId: number, callback: (data: Record<string, number>) => void) => void;
          SensorId?: {
            ROTATION_VECTOR?: number;
          };
        };
        const onceFn = sensorApi.once;
        const rotationVectorId = sensorApi.SensorId?.ROTATION_VECTOR;

        if (typeof onceFn !== 'function' || typeof rotationVectorId !== 'number') {
          resolveOnce(fallbackHeading);
          return;
        }

        onceFn(rotationVectorId, (data: Record<string, number>) => {
          const x = Number(data?.x ?? 0);
          const y = Number(data?.y ?? 0);
          const z = Number(data?.z ?? 0);
          const w = Number(data?.w ?? 1);
          const sinyCosp = 2 * (w * z + x * y);
          const cosyCosp = 1 - 2 * (y * y + z * z);
          const magHeading = (Math.atan2(sinyCosp, cosyCosp) * 180 / Math.PI + 360) % 360;
          resolveOnce({
            magHeading,
            trueHeading: magHeading,
            accuracy: 3,
          });
        });
      } catch (_error) {
        resolveOnce(fallbackHeading);
      }
    });
  }

  private readAddressString(
    addressEntry: geoLocationManager.GeoAddress,
    candidateKeys: string[],
  ): string | null {
    const addressRecord = addressEntry as Record<string, unknown>;

    for (const key of candidateKeys) {
      const value = addressRecord[key];

      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    return null;
  }

  private joinAddressDescriptions(addressEntry: geoLocationManager.GeoAddress): string | null {
    const descriptions = (addressEntry as Record<string, unknown>).descriptions;

    if (!Array.isArray(descriptions) || descriptions.length === 0) {
      return null;
    }

    const normalized = descriptions.filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );

    return normalized.length > 0 ? normalized.join(', ') : null;
  }
}
