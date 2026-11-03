import { util } from '@kit.ArkTS';
import { asset } from '@kit.AssetStoreKit';
import { AnyThreadTurboModule } from '@rnoh/react-native-openharmony/ts';

const ASSET_ALIAS_PREFIX = 'ccnubox:';
const ASSET_NOT_FOUND = 24000002;

export class ExpoHarmonySecureStorageTurboModule extends AnyThreadTurboModule {
  public static readonly NAME = 'ExpoHarmonySecureStorage';

  private readonly encoder = new util.TextEncoder();
  private readonly decoder = util.TextDecoder.create('utf-8');

  async getItem(key: string): Promise<string | null> {
    const query = this.createAliasMap(key);
    query.set(asset.Tag.RETURN_TYPE, asset.ReturnType.ALL);

    try {
      const matches = await asset.query(query);
      const secret = matches[0]?.get(asset.Tag.SECRET);
      return secret instanceof Uint8Array ? this.decoder.decode(secret) : null;
    } catch (error) {
      if (this.isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const attributes = this.createAliasMap(key);
    attributes.set(asset.Tag.SECRET, this.encoder.encode(value));
    attributes.set(
      asset.Tag.ACCESSIBILITY,
      asset.Accessibility.DEVICE_FIRST_UNLOCKED
    );
    attributes.set(asset.Tag.SYNC_TYPE, asset.SyncType.NEVER);
    attributes.set(
      asset.Tag.CONFLICT_RESOLUTION,
      asset.ConflictResolution.OVERWRITE
    );
    await asset.add(attributes);
  }

  async deleteItem(key: string): Promise<void> {
    try {
      await asset.remove(this.createAliasMap(key));
    } catch (error) {
      if (!this.isNotFound(error)) {
        throw error;
      }
    }
  }

  private createAliasMap(key: string): asset.AssetMap {
    const attributes: asset.AssetMap = new Map();
    attributes.set(
      asset.Tag.ALIAS,
      this.encoder.encode(`${ASSET_ALIAS_PREFIX}${key}`)
    );
    return attributes;
  }

  private isNotFound(error: object): boolean {
    return Number((error as { code?: number }).code) === ASSET_NOT_FOUND;
  }
}
