import {
  BackdropBlur,
  Canvas,
  Image as SkImage,
  Skia,
  type SkImage as SkImageType,
  useImage,
} from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

export function useCourseTableBackgroundImage(backgroundUri?: string) {
  const backgroundImageFromHook = useImage(backgroundUri || '');
  const [loadedBackgroundImage, setLoadedBackgroundImage] =
    useState<SkImageType | null>(null);

  useEffect(() => {
    let aborted = false;
    const loadImage = async () => {
      if (!backgroundUri) {
        if (!aborted) setLoadedBackgroundImage(null);
        return;
      }
      try {
        let data = await Skia.Data.fromURI(backgroundUri);
        if (!data) {
          try {
            const base64 = await FileSystem.readAsStringAsync(backgroundUri, {
              encoding: 'base64',
            });
            if (base64) {
              data = Skia.Data.fromBase64(base64);
            }
          } catch {
            // 保留 useImage 和原生 Image 的回退路径。
          }
        }
        if (!aborted && data) {
          const image = Skia.Image.MakeImageFromEncoded(data);
          if (!aborted) setLoadedBackgroundImage(image);
        }
      } catch {
        if (!aborted) setLoadedBackgroundImage(null);
      }
    };
    loadImage();
    return () => {
      aborted = true;
    };
  }, [backgroundUri]);

  return loadedBackgroundImage || backgroundImageFromHook;
}

interface CourseTableBackgroundProps {
  uri: string;
  image?: SkImageType | null;
  mode: 'cover' | 'contain' | 'stretch';
  maskOpacity: number;
  blurRadius: number;
  width: number;
  height: number;
  style: StyleProp<ImageStyle>;
}

export function CourseTableBackground({
  uri,
  image,
  mode,
  maskOpacity,
  blurRadius,
  width,
  height,
  style,
}: CourseTableBackgroundProps) {
  const opacity = 1 - maskOpacity / 100;
  return image ? (
    <Canvas style={style}>
      <SkImage
        image={image}
        x={0}
        y={0}
        width={width}
        height={height}
        fit={
          mode === 'cover' ? 'cover' : mode === 'contain' ? 'contain' : 'fill'
        }
        opacity={opacity}
      />
      {blurRadius > 0 && <BackdropBlur blur={blurRadius} />}
    </Canvas>
  ) : (
    <Image
      source={{ uri }}
      style={[style, { opacity }]}
      resizeMode={
        mode === 'cover' ? 'cover' : mode === 'contain' ? 'contain' : 'stretch'
      }
      blurRadius={blurRadius}
    />
  );
}
