import fs from '@ohos.file.fs';
import http from '@ohos.net.http';
import util from '@ohos.util';
import cryptoFramework from '@ohos.security.cryptoFramework';
import {
  AnyThreadTurboModule,
  AnyThreadTurboModuleContext,
} from '@rnoh/react-native-openharmony/ts';

const MAX_IN_MEMORY_DOWNLOAD_BYTES = 25 * 1024 * 1024;

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
        typeof abilityContext.bundleCodeDir === 'string' &&
        abilityContext.bundleCodeDir.length > 0
          ? abilityContext.bundleCodeDir
          : null,
    };
  }

  async getInfo(
    path: string,
    options?: FileInfoOptions
  ): Promise<FileInfoResult> {
    const normalizedPath = this.normalizeSandboxPath(path, true);
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
      md5:
        options?.md5 === true && !stat.isDirectory()
          ? await this.computeDigest(await this.readFileBytes(normalizedPath))
          : undefined,
    };
  }

  async readAsString(path: string, options?: ReadOptions): Promise<string> {
    const normalizedPath = this.normalizeSandboxPath(path, true);
    const encoding = options?.encoding ?? 'utf8';
    const bytes = await this.readFileBytes(normalizedPath);
    const position =
      typeof options?.position === 'number' && options.position > 0
        ? Math.floor(options.position)
        : 0;
    const length =
      typeof options?.length === 'number' && options.length >= 0
        ? Math.floor(options.length)
        : bytes.length - position;
    const slicedBytes = bytes.slice(position, position + length);

    if (encoding === 'base64') {
      return this.encodeBase64(slicedBytes);
    }

    return this.decodeUtf8(slicedBytes);
  }

  async writeAsString(
    path: string,
    contents: string,
    options?: WriteOptions
  ): Promise<void> {
    const normalizedPath = this.normalizeSandboxPath(path);
    const encoding = options?.encoding ?? 'utf8';

    await this.ensureParentDirectory(normalizedPath);

    const file = await fs.open(
      normalizedPath,
      fs.OpenMode.READ_WRITE |
        fs.OpenMode.CREATE |
        (options?.append === true ? fs.OpenMode.APPEND : fs.OpenMode.TRUNC)
    );

    try {
      if (encoding === 'base64') {
        this.assertValidBase64(contents);
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

  async makeDirectory(
    path: string,
    options?: MakeDirectoryOptions
  ): Promise<void> {
    const normalizedPath = this.normalizeSandboxPath(path);
    try {
      await fs.mkdir(normalizedPath, options?.intermediates === true);
    } catch (error) {
      if (
        options?.intermediates !== true ||
        !fs.accessSync(normalizedPath) ||
        !(await fs.stat(normalizedPath)).isDirectory()
      ) {
        throw error;
      }
    }
  }

  async readDirectory(path: string): Promise<string[]> {
    const normalizedPath = this.normalizeSandboxPath(path, true);
    const stat = await fs.stat(normalizedPath);

    if (!stat.isDirectory()) {
      throw new Error('readDirectory expects a directory path.');
    }

    return fs.listFile(normalizedPath);
  }

  async copy(from: string, to: string): Promise<void> {
    const fromPath = this.normalizeSandboxPath(from);
    const toPath = this.normalizeSandboxPath(to);
    this.assertNotSelfOrDescendant(fromPath, toPath, 'copy');
    await this.copyInternal(fromPath, toPath);
  }

  async move(from: string, to: string): Promise<void> {
    const fromPath = this.normalizeSandboxPath(from);
    const toPath = this.normalizeSandboxPath(to);
    this.assertNotSelfOrDescendant(fromPath, toPath, 'move');
    const stat = await fs.stat(fromPath);

    await this.ensureParentDirectory(toPath);

    if (stat.isDirectory()) {
      await this.copyInternal(fromPath, toPath);
      await this.deleteInternal(fromPath, false);
      return;
    }

    await fs.moveFile(fromPath, toPath);
  }

  async download(
    url: string,
    destinationPath: string,
    options?: DownloadOptions
  ): Promise<DownloadResult> {
    const normalizedDestinationPath =
      this.normalizeSandboxPath(destinationPath);
    await this.ensureParentDirectory(normalizedDestinationPath);
    const request = http.createHttp();
    try {
      const response = await request.request(url, {
        header: options?.headers ?? {},
        expectDataType: http.HttpDataType.ARRAY_BUFFER,
        // ponytail: buffer at most 25 MiB; use streaming for larger downloads.
        maxLimit: MAX_IN_MEMORY_DOWNLOAD_BYTES,
      });
      if (response.responseCode < 200 || response.responseCode >= 300) {
        throw new Error('File download failed with HTTP ' + response.responseCode);
      }
      if (!(response.result instanceof ArrayBuffer)) {
        throw new Error('File download did not return binary data.');
      }
      const buffer = response.result;
      if (buffer.byteLength > MAX_IN_MEMORY_DOWNLOAD_BYTES) {
        throw new Error('File download response is too large for this adapter.');
      }
      const md5 = options?.md5 === true ? await this.computeDigest(new Uint8Array(buffer)) : undefined;
      const temporaryPath = normalizedDestinationPath + '.download-' + util.generateRandomUUID();
      const file = await fs.open(temporaryPath, fs.OpenMode.WRITE_ONLY | fs.OpenMode.CREATE | fs.OpenMode.TRUNC);
      try {
        try {
          if (await fs.write(file.fd, buffer) !== buffer.byteLength) {
            throw new Error('Incomplete file download write.');
          }
        } finally {
          await fs.close(file);
        }
        await fs.rename(temporaryPath, normalizedDestinationPath);
      } catch (error) {
        await fs.unlink(temporaryPath);
        throw error;
      }
      return {
        uri: normalizedDestinationPath,
        status: response.responseCode,
        headers: response.header as Record<string, string>,
        md5,
      };
    } finally {
      request.destroy();
    }
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
        throw new Error(
          `Expected parent path to be a directory: ${parentPath}`
        );
      }

      return;
    }

    await fs.mkdir(parentPath, true);
  }

  private async computeDigest(bytes: Uint8Array): Promise<string> {
    const md = cryptoFramework.createMd('MD5');
    await md.update({ data: bytes });
    const result = await md.digest();
    let digest = '';
    for (const byte of result.data) {
      digest += byte.toString(16).padStart(2, '0');
    }
    return digest;
  }

  private assertNotSelfOrDescendant(
    fromPath: string,
    toPath: string,
    operation: string
  ): void {
    const normalizedFromPath = this.normalizeComparablePath(fromPath);
    const normalizedToPath = this.normalizeComparablePath(toPath);

    if (
      normalizedToPath === normalizedFromPath ||
      normalizedToPath.startsWith(`${normalizedFromPath}/`)
    ) {
      throw new Error(
        `ExpoHarmonyFileSystem cannot ${operation} a directory into itself.`
      );
    }
  }

  private normalizeComparablePath(targetPath: string): string {
    let normalizedPath = targetPath;

    while (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1);
    }

    return normalizedPath;
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

  private async deleteInternal(
    targetPath: string,
    idempotent: boolean
  ): Promise<void> {
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
        await this.copyInternal(
          `${fromPath}/${entryName}`,
          `${toPath}/${entryName}`
        );
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
      const readResult = await fs.read(file.fd, buffer);
      const bytesRead =
        typeof readResult === 'number'
          ? readResult
          : Number(
              (readResult as { bytesRead?: number })?.bytesRead ??
                buffer.byteLength
            );
      return new Uint8Array(
        buffer,
        0,
        Math.max(0, Math.min(buffer.byteLength, bytesRead))
      );
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
      return Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    }
  }

  private encodeBase64(bytes: Uint8Array): string {
    const alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let encoded = '';

    for (let index = 0; index < bytes.length; index += 3) {
      const byte1 = bytes[index] ?? 0;
      const byte2 = bytes[index + 1] ?? 0;
      const byte3 = bytes[index + 2] ?? 0;
      const combined = (byte1 << 16) | (byte2 << 8) | byte3;

      encoded += alphabet[(combined >> 18) & 63] ?? 'A';
      encoded += alphabet[(combined >> 12) & 63] ?? 'A';
      encoded +=
        index + 1 < bytes.length
          ? (alphabet[(combined >> 6) & 63] ?? 'A')
          : '=';
      encoded +=
        index + 2 < bytes.length ? (alphabet[combined & 63] ?? 'A') : '=';
    }

    return encoded;
  }

  private decodeBase64(contents: string): Uint8Array {
    const alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
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

  private assertValidBase64(contents: string): void {
    const sanitizedContents = contents.replace(/\s+/g, '');
    const isValid =
      sanitizedContents.length % 4 === 0 &&
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        sanitizedContents
      );

    if (!isValid) {
      throw new Error('ExpoHarmonyFileSystem expected a valid base64 string.');
    }
  }

  private normalizeSandboxPath(
    inputPath: string,
    allowBundleDirectory = false
  ): string {
    if (typeof inputPath !== 'string' || inputPath.length === 0) {
      throw new Error(
        'ExpoHarmonyFileSystem expected a non-empty sandbox path.'
      );
    }

    if (!inputPath.startsWith('/')) {
      throw new Error(
        'ExpoHarmonyFileSystem accepts only absolute sandbox paths.'
      );
    }

    if (
      inputPath.includes('/../') ||
      inputPath.endsWith('/..') ||
      inputPath.includes('/./')
    ) {
      throw new Error(
        'ExpoHarmonyFileSystem does not accept relative path segments.'
      );
    }

    const allowedRoots = [
      this.ctx.uiAbilityContext.filesDir,
      this.ctx.uiAbilityContext.cacheDir,
      ...(allowBundleDirectory
        ? [this.getConstants().bundleDirectoryPath]
        : []),
    ].filter(
      (value): value is string => typeof value === 'string' && value.length > 0
    );

    const isAllowed = allowedRoots.some(
      rootPath => inputPath === rootPath || inputPath.startsWith(`${rootPath}/`)
    );

    if (!isAllowed) {
      throw new Error('ExpoHarmonyFileSystem accepts only app sandbox paths.');
    }

    return inputPath;
  }
}
