import { util } from '@kit.ArkTS';
import { asset } from '@kit.AssetStoreKit';
import { AnyThreadTurboModule } from '@rnoh/react-native-openharmony/ts';

type StoreOptions = {
  keychainService?: string;
  keychainAccessible?: number;
  requireAuthentication?: boolean;
  accessGroup?: string;
};

export class ExpoHarmonySecureStoreTurboModule extends AnyThreadTurboModule {
  public static readonly NAME = 'ExpoHarmonySecureStore';
  private readonly encoder = new util.TextEncoder();
  private readonly decoder = util.TextDecoder.create('utf-8');

  async getItem(key: string, options: StoreOptions): Promise<string | null> {
    const query = this.alias(key, options);
    query.set(asset.Tag.RETURN_TYPE, asset.ReturnType.ALL);
    try {
      return this.secret(await asset.query(query));
    } catch (error) {
      if (this.isNotFound(error)) return null;
      throw error;
    }
  }

  getItemSync(key: string, options: StoreOptions): string | null {
    const query = this.alias(key, options);
    query.set(asset.Tag.RETURN_TYPE, asset.ReturnType.ALL);
    try {
      return this.secret(asset.querySync(query));
    } catch (error) {
      if (this.isNotFound(error)) return null;
      throw error;
    }
  }

  async setItem(key: string, value: string, options: StoreOptions): Promise<void> {
    await asset.add(this.attributes(key, value, options));
  }

  setItemSync(key: string, value: string, options: StoreOptions): void {
    asset.addSync(this.attributes(key, value, options));
  }

  async deleteItem(key: string, options: StoreOptions): Promise<void> {
    try {
      await asset.remove(this.alias(key, options));
    } catch (error) {
      if (!this.isNotFound(error)) throw error;
    }
  }

  private alias(key: string, options: StoreOptions): asset.AssetMap {
    if (!/^[\w.-]+$/.test(key)) throw new Error('Invalid SecureStore key.');
    if (options.requireAuthentication || options.keychainAccessible === 6 || options.accessGroup != null) {
      throw new Error('SecureStore authentication and access groups are not supported on Harmony.');
    }
    const bytes = this.encoder.encode('expo-harmony:' + JSON.stringify([options.keychainService ?? '', key]));
    if (bytes.length > 256) throw new Error('SecureStore key and service alias exceeds 256 UTF-8 bytes.');
    const query: asset.AssetMap = new Map();
    query.set(asset.Tag.ALIAS, bytes);
    return query;
  }

  private attributes(key: string, value: string, options: StoreOptions): asset.AssetMap {
    const attributes = this.alias(key, options);
    const accessible = options.keychainAccessible ?? 0;
    if (![0, 1, 2, 3, 4, 5].includes(accessible)) throw new Error('Invalid SecureStore accessibility.');
    attributes.set(asset.Tag.SECRET, this.encoder.encode(value));
    attributes.set(asset.Tag.ACCESSIBILITY, accessible === 1 || accessible === 4
      ? asset.Accessibility.DEVICE_FIRST_UNLOCKED
      : accessible === 2 || accessible === 5 ? asset.Accessibility.DEVICE_POWERED_ON : asset.Accessibility.DEVICE_UNLOCKED);
    attributes.set(asset.Tag.SYNC_TYPE, asset.SyncType.NEVER);
    attributes.set(asset.Tag.CONFLICT_RESOLUTION, asset.ConflictResolution.OVERWRITE);
    return attributes;
  }

  private secret(matches: asset.AssetMap[]): string | null {
    const value = matches[0]?.get(asset.Tag.SECRET);
    return value instanceof Uint8Array ? this.decoder.decode(value) : null;
  }

  private isNotFound(error: object): boolean {
    return Number((error as { code?: number }).code) === 24000002;
  }
}
