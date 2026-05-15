import fs from '@ohos.file.fs';
import { AnyThreadTurboModuleContext, AnyThreadTurboModule } from '@rnoh/react-native-openharmony/ts';

type FileInfoOptions = {
  md5?: boolean;
};

type WriteOptions = {
  encoding?: string;
  append?: boolean;
};

type ReadOptions = {
  encoding?: string;
  position?: number;
  length?: number;
};

type MakeDirectoryOptions = {
  intermediates?: boolean;
};

type DeleteOptions = {
  idempotent?: boolean;
};

type FileInfoResult = {
  exists: boolean;
  path: string;
  isDirectory: boolean;
  size?: number;
  modificationTime?: number;
  md5?: string;
};

type DownloadOptions = {
  headers?: Record<string, string>;
  md5?: boolean;
};

type DownloadResult = {
  uri: string;
  status: number;
  headers: Record<string, string>;
  md5?: string;
};

export class ExpoHarmonyFileSystemTurboModule extends AnyThreadTurboModule {
  public static readonly NAME = 'ExpoHarmonyFileSystem';

  public constructor(ctx: AnyThreadTurboModuleContext) {
    super(ctx);
    this.ensureManagedDirectoriesSync();
  }

  getConstants(): {
    documentDirectoryPath: string;
    cacheDirectoryPath: string;
    bundleDirectoryPath: string | null;
  } {
    const abilityContext = this.ctx.uiAbilityContext as {
      bundleCodeDir?: string;
    };

    return {
      documentDirectoryPath: this.documentDirectoryPath,
      cacheDirectoryPath: this.cacheDirectoryPath,
      bundleDirectoryPath:
        typeof abilityContext.bundleCodeDir === 'string' && abilityContext.bundleCodeDir.length > 0
          ? abilityContext.bundleCodeDir
          : null,
    };
  }

  async getInfo(path: string, options?: FileInfoOptions): Promise<FileInfoResult> {
    const normalizedPath = this.normalizeSandboxPath(path);
    const stat = await this.getStatOrNull(normalizedPath);

    if (!stat) {
      return {
        exists: false,
        path: normalizedPath,
        isDirectory: false,
      };
    }

    return {
      exists: true,
      path: normalizedPath,
      isDirectory: stat.isDirectory(),
      size: Number(stat.size),
      modificationTime: Number(stat.mtime),
      md5: undefined,
    };
  }

  async readAsString(path: string, options?: ReadOptions): Promise<string> {
    const normalizedPath = this.normalizeSandboxPath(path);
    const encoding = options?.encoding ?? 'utf8';
    const bytes = await this.readFileBytes(normalizedPath);
    const position = typeof options?.position === 'number' && options.position > 0
      ? Math.floor(options.position)
      : 0;
    const length = typeof options?.length === 'number' && options.length >= 0
      ? Math.floor(options.length)
      : bytes.length - position;
    const slicedBytes = bytes.slice(position, position + length);

    if (encoding === 'base64') {
      return this.encodeBase64(slicedBytes);
    }

    return this.decodeUtf8(slicedBytes);
  }

  async writeAsString(path: string, contents: string, options?: WriteOptions): Promise<void> {
    const normalizedPath = this.normalizeSandboxPath(path);
    const encoding = options?.encoding ?? 'utf8';

    await this.ensureParentDirectory(normalizedPath);

    const file = await fs.open(
      normalizedPath,
      fs.OpenMode.READ_WRITE |
        fs.OpenMode.CREATE |
        (options?.append === true ? fs.OpenMode.APPEND : fs.OpenMode.TRUNC),
    );

    try {
      if (encoding === 'base64') {
        await fs.write(file.fd, this.decodeBase64(contents).buffer);
      } else {
        await fs.write(file.fd, contents);
      }
    } finally {
      await fs.close(file);
    }
  }

  async deletePath(path: string, options?: DeleteOptions): Promise<void> {
    const normalizedPath = this.normalizeSandboxPath(path);
    await this.deleteInternal(normalizedPath, options?.idempotent === true);
  }

  async makeDirectory(path: string, options?: MakeDirectoryOptions): Promise<void> {
    const normalizedPath = this.normalizeSandboxPath(path);
    await fs.mkdir(normalizedPath, options?.intermediates === true);
  }

  async readDirectory(path: string): Promise<string[]> {
    const normalizedPath = this.normalizeSandboxPath(path);
    const stat = await fs.stat(normalizedPath);

    if (!stat.isDirectory()) {
      throw new Error('readDirectory expects a directory path.');
    }

    return fs.listFile(normalizedPath);
  }

  async copy(from: string, to: string): Promise<void> {
    const fromPath = this.normalizeSandboxPath(from);
    const toPath = this.normalizeSandboxPath(to);
    await this.copyInternal(fromPath, toPath);
  }

  async move(from: string, to: string): Promise<void> {
    const fromPath = this.normalizeSandboxPath(from);
    const toPath = this.normalizeSandboxPath(to);
    const stat = await fs.stat(fromPath);

    await this.ensureParentDirectory(toPath);

    if (stat.isDirectory()) {
      await this.copyInternal(fromPath, toPath);
      await this.deleteInternal(fromPath, false);
      return;
    }

    await fs.moveFile(fromPath, toPath);
  }

  async download(url: string, destinationPath: string, options?: DownloadOptions): Promise<DownloadResult> {
    const normalizedDestinationPath = this.normalizeSandboxPath(destinationPath);
    await this.ensureParentDirectory(normalizedDestinationPath);
    const fetchFn = (globalThis as {
      fetch?: (input: string, init?: { headers?: Record<string, string> }) => Promise<{
        arrayBuffer: () => Promise<ArrayBuffer>;
        status?: number;
      }>;
    }).fetch;

    if (typeof fetchFn !== 'function') {
      throw new Error('ExpoHarmonyFileSystem requires global fetch support for downloadAsync.');
    }

    const response = await fetchFn(url, {
      headers: options?.headers ?? {},
    });
    const responseBuffer = new Uint8Array(await response.arrayBuffer());
    const file = await fs.open(
      normalizedDestinationPath,
      fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.TRUNC,
    );

    try {
      await fs.write(file.fd, responseBuffer.buffer);
    } finally {
      await fs.close(file);
    }

    return {
      uri: normalizedDestinationPath,
      status: Number(response.status ?? 200),
      headers: {},
      md5: undefined,
    };
  }

  private get documentDirectoryPath(): string {
    return `${this.ctx.uiAbilityContext.filesDir}/expo-harmony/document`;
  }

  private get cacheDirectoryPath(): string {
    return `${this.ctx.uiAbilityContext.cacheDir}/expo-harmony/cache`;
  }

  private ensureManagedDirectoriesSync(): void {
    this.ensureDirectorySync(this.documentDirectoryPath);
    this.ensureDirectorySync(this.cacheDirectoryPath);
  }

  private ensureDirectorySync(directoryPath: string): void {
    if (!fs.accessSync(directoryPath)) {
      fs.mkdirSync(directoryPath, true);
    }
  }

  private async ensureParentDirectory(targetPath: string): Promise<void> {
    const parentPath = this.getParentPath(targetPath);

    if (!parentPath) {
      return;
    }

    const parentStat = await this.getStatOrNull(parentPath);

    if (parentStat) {
      if (!parentStat.isDirectory()) {
        throw new Error(`Expected parent path to be a directory: ${parentPath}`);
      }

      return;
    }

    await fs.mkdir(parentPath, true);
  }

  private getParentPath(targetPath: string): string | null {
    let normalizedPath = targetPath;

    while (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    const slashIndex = normalizedPath.lastIndexOf('/');

    if (slashIndex <= 0) {
      return null;
    }

    return normalizedPath.slice(0, slashIndex);
  }

  private async deleteInternal(targetPath: string, idempotent: boolean): Promise<void> {
    const stat = await this.getStatOrNull(targetPath);

    if (!stat) {
      if (idempotent) {
        return;
      }

      throw new Error(`No file or directory exists at ${targetPath}.`);
    }

    if (stat.isDirectory()) {
      const entries = await fs.listFile(targetPath);

      for (const entryName of entries) {
        await this.deleteInternal(`${targetPath}/${entryName}`, idempotent);
      }

      await fs.rmdir(targetPath);
      return;
    }

    await fs.unlink(targetPath);
  }

  private async copyInternal(fromPath: string, toPath: string): Promise<void> {
    const stat = await fs.stat(fromPath);

    await this.ensureParentDirectory(toPath);

    if (stat.isDirectory()) {
      await fs.mkdir(toPath, true);
      const entries = await fs.listFile(fromPath);

      for (const entryName of entries) {
        await this.copyInternal(`${fromPath}/${entryName}`, `${toPath}/${entryName}`);
      }

      return;
    }

    await fs.copyFile(fromPath, toPath);
  }

  private async getStatOrNull(targetPath: string): Promise<fs.Stat | null> {
    try {
      return await fs.stat(targetPath);
    } catch (error) {
      if (this.isNoSuchFileError(error)) {
        return null;
      }

      throw error;
    }
  }

  private isNoSuchFileError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      Number((error as { code?: number }).code) === 13900002
    );
  }

  private async readFileBytes(targetPath: string): Promise<Uint8Array> {
    const stat = await fs.stat(targetPath);
    const file = await fs.open(targetPath, fs.OpenMode.READ_ONLY);
    const buffer = new ArrayBuffer(Number(stat.size ?? 0));

    try {
      await fs.read(file.fd, buffer);
      return new Uint8Array(buffer);
    } finally {
      await fs.close(file);
    }
  }

  private decodeUtf8(bytes: Uint8Array): string {
    let encoded = '';

    for (const byte of bytes) {
      encoded += '%' + byte.toString(16).padStart(2, '0');
    }

    try {
      return decodeURIComponent(encoded);
    } catch (_error) {
      return Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    }
  }

  private encodeBase64(bytes: Uint8Array): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let encoded = '';

    for (let index = 0; index < bytes.length; index += 3) {
      const byte1 = bytes[index] ?? 0;
      const byte2 = bytes[index + 1] ?? 0;
      const byte3 = bytes[index + 2] ?? 0;
      const combined = (byte1 << 16) | (byte2 << 8) | byte3;

      encoded += alphabet[(combined >> 18) & 63] ?? 'A';
      encoded += alphabet[(combined >> 12) & 63] ?? 'A';
      encoded += index + 1 < bytes.length ? alphabet[(combined >> 6) & 63] ?? 'A' : '=';
      encoded += index + 2 < bytes.length ? alphabet[combined & 63] ?? 'A' : '=';
    }

    return encoded;
  }

  private decodeBase64(contents: string): Uint8Array {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const sanitizedContents = contents.replace(/\s+/g, '');
    const bytes: number[] = [];

    for (let index = 0; index < sanitizedContents.length; index += 4) {
      const chunk = sanitizedContents.slice(index, index + 4);
      const char1 = chunk[0] ?? 'A';
      const char2 = chunk[1] ?? 'A';
      const char3 = chunk[2] ?? 'A';
      const char4 = chunk[3] ?? 'A';
      const value1 = alphabet.indexOf(char1);
      const value2 = alphabet.indexOf(char2);
      const value3 = char3 === '=' ? 0 : alphabet.indexOf(char3);
      const value4 = char4 === '=' ? 0 : alphabet.indexOf(char4);
      const combined =
        ((value1 >= 0 ? value1 : 0) << 18) |
        ((value2 >= 0 ? value2 : 0) << 12) |
        ((value3 >= 0 ? value3 : 0) << 6) |
        (value4 >= 0 ? value4 : 0);

      bytes.push((combined >> 16) & 255);

      if (char3 !== '=') {
        bytes.push((combined >> 8) & 255);
      }

      if (char4 !== '=') {
        bytes.push(combined & 255);
      }
    }

    return new Uint8Array(bytes);
  }

  private normalizeSandboxPath(inputPath: string): string {
    if (typeof inputPath !== 'string' || inputPath.length === 0) {
      throw new Error('ExpoHarmonyFileSystem expected a non-empty sandbox path.');
    }

    if (!inputPath.startsWith('/')) {
      throw new Error('ExpoHarmonyFileSystem accepts only absolute sandbox paths.');
    }

    if (inputPath.includes('/../') || inputPath.endsWith('/..') || inputPath.includes('/./')) {
      throw new Error('ExpoHarmonyFileSystem does not accept relative path segments.');
    }

    const allowedRoots = [
      this.ctx.uiAbilityContext.filesDir,
      this.ctx.uiAbilityContext.cacheDir,
    ].filter((value): value is string => typeof value === 'string' && value.length > 0);

    const isAllowed = allowedRoots.some(
      (rootPath) => inputPath === rootPath || inputPath.startsWith(`${rootPath}/`),
    );

    if (!isAllowed) {
      throw new Error('ExpoHarmonyFileSystem accepts only app sandbox paths.');
    }

    return inputPath;
  }
}
