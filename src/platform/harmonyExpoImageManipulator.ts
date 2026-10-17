import * as FileSystem from 'expo-file-system/legacy';

export const SaveFormat = {
  JPEG: 'jpeg',
  PNG: 'png',
  WEBP: 'webp',
} as const;

export const manipulateAsync = async (
  uri: string,
  actions: unknown[],
  options: { format?: string } = {}
) => {
  if (actions.length > 0 || options.format !== SaveFormat.PNG) {
    throw new Error(
      'Harmony course export supports PNG encoding without image transforms.'
    );
  }

  const match = /^data:image\/png;base64,(.+)$/s.exec(uri);
  if (!match || !FileSystem.cacheDirectory) {
    throw new Error('Harmony course export expected PNG base64 data.');
  }

  const outputUri = `${FileSystem.cacheDirectory}course-table-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(outputUri, match[1], {
    encoding: FileSystem.EncodingType.Base64,
  });

  return { uri: outputUri, width: 0, height: 0 };
};
