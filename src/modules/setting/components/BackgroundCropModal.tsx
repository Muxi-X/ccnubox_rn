import { BottomSheet } from '@rneui/themed';
import {
  ImageManipulator as ImageManipulatorModule,
  type ImageManipulatorContext,
  type ImageRef,
} from 'expo-image-manipulator';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BackgroundCropRect } from '@/store/courseTableAppearance';
import useVisualScheme from '@/store/visualScheme';
import { commonColors } from '@/styles/common';

interface BackgroundCropModalProps {
  visible: boolean;
  uri: string;
  sourceSize?: { width: number; height: number };
  aspectRatio: number;
  modeLabel: string;
  confirming?: boolean;
  initialCrop?: BackgroundCropRect;
  onCancel: () => void;
  onConfirm: (crop: BackgroundCropRect) => void;
}

export default function BackgroundCropModal({
  visible,
  uri,
  sourceSize,
  aspectRatio,
  modeLabel,
  confirming = false,
  initialCrop,
  onCancel,
  onConfirm,
}: BackgroundCropModalProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const themeName = useVisualScheme(state => state.themeName);
  const isDarkTheme = themeName === 'dark';
  const sheetBackgroundColor =
    currentStyle?.background_style?.backgroundColor ??
    (isDarkTheme ? '#242424' : '#FFFFFF');
  const textColor =
    currentStyle?.text_style?.color ?? (isDarkTheme ? '#F2F2F3' : '#1D1D23');
  const handleColor =
    currentStyle?.secondary_background_style?.backgroundColor ??
    (isDarkTheme ? '#555555' : '#D8D8DC');
  const gridColor = isDarkTheme
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.22)';
  const confirmColor = isDarkTheme
    ? commonColors.lightPurple
    : commonColors.purple;
  const isFullScreen = windowHeight < 760 || windowWidth < 360;
  const sheetHeight = isFullScreen
    ? windowHeight
    : Math.round(Math.min(windowHeight * 0.72, 760));
  const sheetContentHeight = isFullScreen
    ? windowHeight - insets.top - insets.bottom
    : sheetHeight - insets.bottom;
  const availableWidth = windowWidth - insets.left - insets.right;
  const sheetWidth =
    windowWidth >= 600 ? Math.min(availableWidth, 720) : availableWidth;
  const [imageSize, setImageSize] = useState(
    sourceSize || { width: 0, height: 0 }
  );
  const zoom = useSharedValue(1);
  const startingZoom = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const startingX = useSharedValue(0);
  const startingY = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    let context: ImageManipulatorContext | undefined;
    let image: ImageRef | undefined;
    setImageSize({ width: 0, height: 0 });
    const readSourceSize = async () => {
      try {
        context = ImageManipulatorModule.manipulate(uri);
        image = await context.renderAsync();
        if (!cancelled) {
          setImageSize({ width: image.width, height: image.height });
        }
      } catch {
        if (!cancelled && sourceSize) setImageSize(sourceSize);
      } finally {
        image?.release();
        context?.release();
      }
    };
    void readSourceSize();
    return () => {
      cancelled = true;
    };
  }, [sourceSize, uri]);

  const metrics = useMemo(() => {
    if (!imageSize.width || !imageSize.height) return null;
    const maxWidth = Math.max(120, availableWidth - 40);
    const maxHeight = Math.max(180, sheetContentHeight - 124);
    const frameWidth = Math.min(maxWidth, maxHeight * aspectRatio);
    const frameHeight = frameWidth / aspectRatio;
    const baseScale = Math.max(
      frameWidth / imageSize.width,
      frameHeight / imageSize.height
    );
    const baseWidth = imageSize.width * baseScale;
    const baseHeight = imageSize.height * baseScale;
    return {
      frameWidth,
      frameHeight,
      baseScale,
      baseWidth,
      baseHeight,
    };
  }, [
    aspectRatio,
    availableWidth,
    imageSize.height,
    imageSize.width,
    insets.bottom,
    isFullScreen,
    sheetContentHeight,
    windowWidth,
  ]);

  useEffect(() => {
    if (!metrics) return;
    let nextZoom = 1;
    let nextX = 0;
    let nextY = 0;
    if (initialCrop && imageSize.width && imageSize.height) {
      nextZoom = Math.max(
        1,
        metrics.frameWidth / (initialCrop.width * metrics.baseScale),
        metrics.frameHeight / (initialCrop.height * metrics.baseScale)
      );
      const cropCenterX =
        (initialCrop.originX + initialCrop.width / 2) *
        metrics.baseScale *
        nextZoom;
      const cropCenterY =
        (initialCrop.originY + initialCrop.height / 2) *
        metrics.baseScale *
        nextZoom;
      nextX = (metrics.baseWidth * nextZoom) / 2 - cropCenterX;
      nextY = (metrics.baseHeight * nextZoom) / 2 - cropCenterY;
    }
    zoom.value = nextZoom;
    offsetX.value = nextX;
    offsetY.value = nextY;
  }, [
    imageSize.height,
    imageSize.width,
    initialCrop,
    metrics,
    offsetX,
    offsetY,
    zoom,
  ]);

  const pan = Gesture.Pan()
    .onStart(() => {
      startingX.value = offsetX.value;
      startingY.value = offsetY.value;
    })
    .onUpdate(event => {
      if (!metrics) return;
      const maxX = Math.max(
        0,
        (metrics.baseWidth * zoom.value - metrics.frameWidth) / 2
      );
      const maxY = Math.max(
        0,
        (metrics.baseHeight * zoom.value - metrics.frameHeight) / 2
      );
      offsetX.value = Math.max(
        -maxX,
        Math.min(maxX, startingX.value + event.translationX)
      );
      offsetY.value = Math.max(
        -maxY,
        Math.min(maxY, startingY.value + event.translationY)
      );
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startingZoom.value = zoom.value;
    })
    .onUpdate(event => {
      if (!metrics) return;
      const nextZoom = Math.max(
        1,
        Math.min(5, startingZoom.value * event.scale)
      );
      zoom.value = nextZoom;
      const maxX = Math.max(
        0,
        (metrics.baseWidth * nextZoom - metrics.frameWidth) / 2
      );
      const maxY = Math.max(
        0,
        (metrics.baseHeight * nextZoom - metrics.frameHeight) / 2
      );
      offsetX.value = Math.max(-maxX, Math.min(maxX, offsetX.value));
      offsetY.value = Math.max(-maxY, Math.min(maxY, offsetY.value));
    });

  const gesture = Gesture.Simultaneous(pan, pinch);
  const imageStyle = useAnimatedStyle(() => {
    if (!metrics) return {};
    const width = metrics.baseWidth * zoom.value;
    const height = metrics.baseHeight * zoom.value;
    return {
      left: (metrics.frameWidth - width) / 2 + offsetX.value,
      top: (metrics.frameHeight - height) / 2 + offsetY.value,
      width,
      height,
    };
  });

  const handleConfirm = () => {
    if (!metrics || !imageSize.width || !imageSize.height) return;
    const displayedScale = metrics.baseScale * zoom.value;
    const left =
      metrics.frameWidth / 2 +
      offsetX.value -
      (metrics.baseWidth * zoom.value) / 2;
    const top =
      metrics.frameHeight / 2 +
      offsetY.value -
      (metrics.baseHeight * zoom.value) / 2;
    const originX = Math.max(
      0,
      Math.min(imageSize.width - 1, Math.floor(-left / displayedScale))
    );
    const originY = Math.max(
      0,
      Math.min(imageSize.height - 1, Math.floor(-top / displayedScale))
    );
    onConfirm({
      originX,
      originY,
      width: Math.max(
        1,
        Math.min(
          imageSize.width - originX,
          Math.round(metrics.frameWidth / displayedScale)
        )
      ),
      height: Math.max(
        1,
        Math.min(
          imageSize.height - originY,
          Math.round(metrics.frameHeight / displayedScale)
        )
      ),
    });
  };

  return (
    <BottomSheet
      isVisible={visible}
      animationType="slide"
      animationDuration={280}
      easing={Easing.out(Easing.cubic)}
      onBackdropPress={onCancel}
      backdropStyle={styles.backdrop}
      containerStyle={[
        styles.sheetContainer,
        isFullScreen && { backgroundColor: sheetBackgroundColor },
      ]}
      scrollViewProps={{
        scrollEnabled: false,
        contentContainerStyle: styles.sheetScrollContent,
      }}
    >
      <GestureHandlerRootView style={styles.root}>
        <StatusBar
          barStyle={isDarkTheme ? 'light-content' : 'dark-content'}
          backgroundColor={sheetBackgroundColor}
        />
        <View
          style={[
            styles.container,
            {
              width: sheetWidth,
              height: sheetContentHeight,
              paddingTop: 8,
              paddingBottom: 12,
              backgroundColor: sheetBackgroundColor,
            },
            !isFullScreen && styles.bottomSheet,
          ]}
        >
          <View style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={onCancel}>
              <Text style={[styles.headerAction, { color: textColor }]}>
                取消
              </Text>
            </Pressable>
            <Text style={[styles.title, { color: textColor }]}>
              裁剪背景 · {modeLabel}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={!metrics || confirming}
              onPress={handleConfirm}
            >
              <Text
                style={[
                  styles.headerAction,
                  styles.confirm,
                  { color: confirmColor },
                ]}
              >
                {confirming ? '保存中' : '完成'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.content}>
            {metrics ? (
              <View
                style={[
                  styles.cropFrame,
                  {
                    width: metrics.frameWidth,
                    height: metrics.frameHeight,
                    borderColor: textColor,
                  },
                ]}
              >
                <GestureDetector gesture={gesture}>
                  <View style={styles.frameContent}>
                    <Animated.Image
                      source={{ uri }}
                      resizeMode="stretch"
                      style={[styles.image, imageStyle]}
                    />
                    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                      <View
                        style={[
                          styles.gridVertical,
                          { left: '33.333%', backgroundColor: gridColor },
                        ]}
                      />
                      <View
                        style={[
                          styles.gridVertical,
                          { left: '66.666%', backgroundColor: gridColor },
                        ]}
                      />
                      <View
                        style={[
                          styles.gridHorizontal,
                          { top: '33.333%', backgroundColor: gridColor },
                        ]}
                      />
                      <View
                        style={[
                          styles.gridHorizontal,
                          { top: '66.666%', backgroundColor: gridColor },
                        ]}
                      />
                    </View>
                  </View>
                </GestureDetector>
              </View>
            ) : (
              <ActivityIndicator color={textColor} size="large" />
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    backgroundColor: 'transparent',
  },
  sheetScrollContent: {
    flexGrow: 1,
  },
  bottomSheet: {
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    flex: 1,
  },
  handleArea: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    height: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    minWidth: 44,
    fontSize: 16,
  },
  confirm: {
    color: '#a993ff',
    textAlign: 'right',
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropFrame: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  frameContent: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  gridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
