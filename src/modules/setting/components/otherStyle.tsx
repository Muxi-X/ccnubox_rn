import { Switch } from '@ant-design/react-native';
import { ButtonGroup } from '@rneui/themed';
import {
  BackdropBlur,
  Canvas,
  Skia,
  Image as SkImage,
  SkImage as SkImageType,
  useImage,
} from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system/legacy';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

import BaseLightImage from '@/assets/images/theme/base.png';
import BaseDarkImage from '@/assets/images/theme/baseDark.png';
import IosLightImage from '@/assets/images/theme/ios.png';
import IosDarkImage from '@/assets/images/theme/iosDark.png';
import Button from '@/components/button';
import Slider from '@/components/slider';
import Toast from '@/components/toast';
import { default as ThemeBasedView } from '@/components/view';
import { PERMISSION_PURPOSES } from '@/constants/PERMISSIONS';
import {
  COURSE_HEADER_HEIGHT,
  COURSE_ITEM_HEIGHT,
  COURSE_ITEM_WIDTH,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  TIME_WIDTH,
} from '@/constants/SCHEDULE';
import { CourseTransferType } from '@/modules/courseTable/components/courseTable/type';
import BackgroundCropModal from '@/modules/setting/components/BackgroundCropModal';
import useCourseTableAppearance, {
  type BackgroundCropRect,
} from '@/store/courseTableAppearance';
import useVisualScheme from '@/store/visualScheme';
import { commonColors } from '@/styles/common';
import { componentMap } from '@/themeBasedComponents';
import { runPermissionAction } from '@/utils/requestPermission';

const BACKGROUND_DIRECTORY = 'course-table-background/';

async function copyBackgroundToDocuments(uri: string, extension: string) {
  const documentDirectory = FileSystem.documentDirectory;
  if (!documentDirectory) throw new Error('无法访问应用存储目录');
  const directory = `${documentDirectory}${BACKGROUND_DIRECTORY}`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
  const destination = `${directory}${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${safeExtension}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}

async function removeBackgroundFiles(uris: Array<string | undefined>) {
  const documentDirectory = FileSystem.documentDirectory;
  if (!documentDirectory) return;
  const prefix = `${documentDirectory}${BACKGROUND_DIRECTORY}`;
  await Promise.all(
    [...new Set(uris.filter((uri): uri is string => Boolean(uri)))].map(
      async uri => {
        if (!uri.startsWith(prefix)) return;
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch {
          // Ignore stale background files.
        }
      }
    )
  );
}

async function cropBackgroundImage(uri: string, crop: BackgroundCropRect) {
  const context = ImageManipulator.manipulate(uri);
  try {
    context.crop(crop);
    const image = await context.renderAsync();
    try {
      return await image.saveAsync({
        compress: 0.92,
        format: SaveFormat.JPEG,
      });
    } finally {
      image.release();
    }
  } finally {
    context.release();
  }
}

const LAYOUTS = [
  {
    key: 'android',
    label: '原版',
    imageDark: BaseDarkImage,
    imageLight: BaseLightImage,
  },
  {
    key: 'ios',
    label: 'iOS版',
    imageDark: IosDarkImage,
    imageLight: IosLightImage,
  },
] as const;

const LayoutButton = memo(function LayoutButton({
  label,
  image,
  selected,
  dark,
}: {
  label: string;
  image: any;
  selected: boolean;
  dark: boolean;
}) {
  return (
    <View style={styles.layoutButtonContent}>
      <Image source={image} style={styles.layoutPreview} resizeMode="cover" />
      <Text
        style={[
          styles.layoutLabel,
          dark && styles.layoutLabelDark,
          selected && styles.layoutLabelSelected,
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

const PREVIEW_COURSE_DATA: CourseTransferType = {
  id: 'preview',
  courseName: '示例课程',
  teacher: '张老师',
  classroom: 'A101',
  timeSpan: 2,
  rowIndex: 0,
  colIndex: 0,
  date: DAYS_OF_WEEK[0],
  isThisWeek: true,
  week_duration: '1-16周',
  credit: 3,
  class_when: '1-2',
  weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  is_official: true,
};

interface OtherStyleProps {
  onSliderTouchStart?: () => void;
  onSliderTouchEnd?: () => void;
}

export default function OtherStyle({
  onSliderTouchStart,
  onSliderTouchEnd,
}: OtherStyleProps) {
  const { currentStyle, themeName } = useVisualScheme();
  const layoutName = useVisualScheme(state => state.layoutName);
  const changeLayout = useVisualScheme(state => state.changeLayout);
  const {
    backgroundUri,
    backgroundSourceUri,
    backgroundSourceSize,
    backgroundScrollableCropRect,
    backgroundFixedCropRect,
    backgroundViewportSize,
    backgroundScrollable,
    foregroundOpacity,
    backgroundMaskOpacity,
    backgroundBlurRadius,
    setBackgroundUri,
    setBackgroundSource,
    setBackgroundCrop,
    setBackgroundScrollable,
    setForegroundOpacity,
    setBackgroundMaskOpacity,
    setBackgroundBlurRadius,
  } = useCourseTableAppearance();

  const CourseItem = componentMap?.[layoutName].CourseItem;

  const [isPicking, setIsPicking] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);
  // 使用本地 state 存储滑块的临时值，减少 store 更新频率
  const [localOpacity, setLocalOpacity] = useState(foregroundOpacity);
  const [localBlurRadius, setLocalBlurRadius] = useState(backgroundBlurRadius);
  const [localMaskOpacity, setLocalMaskOpacity] = useState(
    backgroundMaskOpacity
  );
  const opacityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maskTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cropSourceUri = backgroundSourceUri || backgroundUri || '';
  const fallbackViewportSize = Dimensions.get('window');
  const fixedViewportSize = backgroundViewportSize || fallbackViewportSize;
  const cropAspectRatio = backgroundScrollable
    ? (TIME_WIDTH + COURSE_ITEM_WIDTH * DAYS_OF_WEEK.length) /
      (COURSE_HEADER_HEIGHT + COURSE_ITEM_HEIGHT * TIME_SLOTS.length)
    : fixedViewportSize.width / fixedViewportSize.height;
  const currentCropRect = backgroundScrollable
    ? backgroundScrollableCropRect
    : backgroundFixedCropRect;
  // 背景图加载 — 与课表实际渲染保持一致
  const backgroundImageFromHook = useImage(backgroundUri || '');
  const [loadedBackgroundImage, setLoadedBackgroundImage] =
    useState<SkImageType | null>(null);
  const [loadedBackgroundUri, setLoadedBackgroundUri] = useState<string>();

  useEffect(() => {
    let aborted = false;
    const loadImage = async () => {
      if (!backgroundUri) {
        if (!aborted) {
          setLoadedBackgroundImage(null);
          setLoadedBackgroundUri(undefined);
        }
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
            // ignore
          }
        }
        if (!aborted && data) {
          const image = Skia.Image.MakeImageFromEncoded(data);
          if (!aborted) {
            setLoadedBackgroundImage(image);
            setLoadedBackgroundUri(backgroundUri);
          }
        }
      } catch {
        if (!aborted) {
          setLoadedBackgroundImage(null);
          setLoadedBackgroundUri(undefined);
        }
      }
    };
    loadImage();
    return () => {
      aborted = true;
    };
  }, [backgroundUri]);

  const backgroundImage =
    loadedBackgroundUri === backgroundUri && loadedBackgroundImage
      ? loadedBackgroundImage
      : backgroundImageFromHook;

  // 同步 store 的值到本地 state
  useEffect(() => {
    setLocalOpacity(foregroundOpacity);
  }, [foregroundOpacity]);
  useEffect(() => {
    setLocalBlurRadius(backgroundBlurRadius);
  }, [backgroundBlurRadius]);
  useEffect(() => {
    setLocalMaskOpacity(backgroundMaskOpacity);
  }, [backgroundMaskOpacity]);

  const renderCoursePreview = (opacity: number) =>
    CourseItem ? (
      <View style={styles.previewRow}>
        <View style={[styles.previewCourse, { opacity }]}>
          <CourseItem {...PREVIEW_COURSE_DATA} id="preview-1" />
        </View>
        <View style={[styles.previewCourse, { opacity }]}>
          <CourseItem {...PREVIEW_COURSE_DATA} id="preview-2" />
        </View>
      </View>
    ) : (
      <View style={styles.previewCourse}>
        <View style={styles.previewPlaceholder}>
          <Text
            style={[currentStyle?.text_style, styles.previewPlaceholderText]}
          >
            示例课程
          </Text>
        </View>
      </View>
    );

  const renderPreview = () => {
    const normalizedOpacity = (100 - localOpacity) / 100;

    if (!backgroundUri) {
      return (
        <View style={styles.previewContent}>
          {renderCoursePreview(normalizedOpacity)}
        </View>
      );
    }

    return (
      <View style={styles.previewBackground}>
        {/* 与课表实际渲染完全一致：Canvas 绘制背景图 + 模糊 */}
        {backgroundImage ? (
          <Canvas style={styles.previewBlurCanvas}>
            <SkImage
              image={backgroundImage}
              x={0}
              y={0}
              width={COURSE_ITEM_WIDTH * 3}
              height={180}
              fit="cover"
              opacity={1 - localMaskOpacity / 100}
            />
            {localBlurRadius > 0 && <BackdropBlur blur={localBlurRadius} />}
          </Canvas>
        ) : (
          <Image
            source={{ uri: backgroundUri }}
            style={[
              styles.previewBlurCanvas,
              { opacity: 1 - localMaskOpacity / 100 },
            ]}
            resizeMode="cover"
            blurRadius={localBlurRadius}
          />
        )}
        <View style={styles.previewContent}>
          {renderCoursePreview(normalizedOpacity)}
        </View>
      </View>
    );
  };

  const handlePickImage = async () => {
    try {
      setIsPicking(true);
      const result = await runPermissionAction({
        action: () =>
          ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.9,
          }),
        purpose: PERMISSION_PURPOSES.courseTableBackground,
      });

      const asset = result && !result.canceled ? result.assets?.[0] : undefined;
      if (asset?.uri) {
        const fileExtension =
          asset.fileName?.split('.').pop() ||
          asset.mimeType?.split('/').pop()?.replace('jpeg', 'jpg') ||
          'jpg';
        const savedUri = await copyBackgroundToDocuments(
          asset.uri,
          fileExtension
        );
        const previous = useCourseTableAppearance.getState();
        setBackgroundSource(savedUri, {
          width: asset.width,
          height: asset.height,
        });
        void removeBackgroundFiles([
          previous.backgroundSourceUri,
          previous.backgroundScrollableCropUri,
          previous.backgroundFixedCropUri,
        ]);
        Toast.show({
          text: '背景图片设置成功',
          icon: 'success',
        });
      }
    } catch (error) {
      Toast.show({
        text: `选择图片失败：${error}`,
        icon: 'fail',
      });
    } finally {
      setIsPicking(false);
    }
  };

  const handleOpenCrop = () => {
    if (!cropSourceUri) return;
    if (!backgroundSourceUri) {
      setBackgroundSource(backgroundUri);
    }
    setIsCropModalVisible(true);
  };

  const handleCropConfirm = async (crop: BackgroundCropRect) => {
    const sourceUri = cropSourceUri;
    const scrollable = backgroundScrollable;
    if (!sourceUri) return;
    try {
      setIsCropping(true);
      const result = await cropBackgroundImage(sourceUri, crop);
      const savedUri = await copyBackgroundToDocuments(result.uri, 'jpg');
      const previous = useCourseTableAppearance.getState();
      const currentSourceUri =
        previous.backgroundSourceUri || previous.backgroundUri;
      if (currentSourceUri !== sourceUri) {
        void removeBackgroundFiles([savedUri]);
        setIsCropModalVisible(false);
        return;
      }
      setBackgroundCrop(scrollable, savedUri, crop);
      void removeBackgroundFiles([
        scrollable
          ? previous.backgroundScrollableCropUri
          : previous.backgroundFixedCropUri,
      ]);
      setIsCropModalVisible(false);
      Toast.show({ text: '背景裁剪已保存', icon: 'success' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : '未知错误';
      Toast.show({ text: `裁剪图片失败：${message}`, icon: 'fail' });
    } finally {
      setIsCropping(false);
    }
  };

  const handleClearBackground = () => {
    const previous = useCourseTableAppearance.getState();
    setBackgroundUri(undefined);
    void removeBackgroundFiles([
      previous.backgroundSourceUri,
      previous.backgroundScrollableCropUri,
      previous.backgroundFixedCropUri,
    ]);
    Toast.show({
      text: '已清除背景图片',
      icon: 'success',
    });
  };

  const handleBlurRadiusChange = (value: number) => {
    const roundedValue = Math.round(value);
    setLocalBlurRadius(roundedValue);

    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
    }

    blurTimerRef.current = setTimeout(() => {
      setBackgroundBlurRadius(roundedValue);
      blurTimerRef.current = null;
    }, 100);
  };

  const handleOpacityChange = (value: number) => {
    const roundedValue = Math.round(value);
    setLocalOpacity(roundedValue);

    if (opacityTimerRef.current) {
      clearTimeout(opacityTimerRef.current);
    }

    opacityTimerRef.current = setTimeout(() => {
      setForegroundOpacity(roundedValue);
      opacityTimerRef.current = null;
    }, 100);
  };

  const handleMaskOpacityChange = (value: number) => {
    const roundedValue = Math.round(value);
    setLocalMaskOpacity(roundedValue);

    if (maskTimerRef.current) {
      clearTimeout(maskTimerRef.current);
    }

    maskTimerRef.current = setTimeout(() => {
      setBackgroundMaskOpacity(roundedValue);
      maskTimerRef.current = null;
    }, 100);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (opacityTimerRef.current) clearTimeout(opacityTimerRef.current);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      if (maskTimerRef.current) clearTimeout(maskTimerRef.current);
    };
  }, []);

  const selectedLayoutIndex = LAYOUTS.findIndex(l => l.key === layoutName);

  const layoutButtons = useMemo(
    () =>
      LAYOUTS.map(l => ({
        element: () => (
          <LayoutButton
            label={l.label}
            image={themeName === 'dark' ? l.imageDark : l.imageLight}
            selected={l.key === layoutName}
            dark={themeName === 'dark'}
          />
        ),
      })),
    [themeName, layoutName]
  );

  return (
    <ThemeBasedView style={styles.container}>
      {/* 实时预览 */}
      <View style={styles.previewSection}>
        <Text style={[currentStyle?.text_style, styles.previewTitle]}>
          效果预览
        </Text>
        <View
          style={[
            styles.previewWrapper,
            {
              borderColor: currentStyle?.schedule_border_style?.borderColor,
              backgroundColor: currentStyle?.background_style?.backgroundColor,
            },
          ]}
        >
          {renderPreview()}
        </View>
      </View>

      {/* 样式选择 */}
      <Text style={[currentStyle?.text_style, styles.sectionLabel]}>
        样式选择
      </Text>
      <ButtonGroup
        buttons={layoutButtons}
        selectedIndex={selectedLayoutIndex}
        onPress={index => {
          const layout = LAYOUTS[index];
          if (layout && layout.key !== layoutName) {
            changeLayout(layout.key);
          }
        }}
        containerStyle={[
          styles.layoutButtonGroup,
          {
            borderColor: themeName === 'dark' ? '#444' : '#ddd',
            backgroundColor: themeName === 'dark' ? '#1c1c1e' : '#fff',
          },
        ]}
        buttonStyle={[
          styles.layoutButton,
          {
            backgroundColor: 'transparent',
          },
        ]}
        buttonContainerStyle={styles.layoutButtonContainer}
        selectedButtonStyle={[
          styles.layoutButtonSelected,
          {
            backgroundColor:
              themeName === 'dark'
                ? 'rgba(147, 121, 246, 0.15)'
                : 'rgba(147, 121, 246, 0.08)',
          },
        ]}
        innerBorderStyle={{
          color: themeName === 'dark' ? '#444' : '#ddd',
          width: 1,
        }}
      />

      {/* 背景设置 */}
      <Text style={[currentStyle?.text_style, styles.sectionLabel]}>
        背景设置
      </Text>
      <View style={styles.settingRow}>
        <Text style={[currentStyle?.text_style, styles.settingLabel]}>
          背景图片
        </Text>
        <View style={styles.actionButtons}>
          {backgroundUri && (
            <Button
              type="Secondary"
              containerStyle={[styles.actionButton, styles.actionButtonSpacing]}
              buttonStyle={styles.actionButtonInner}
              onPress={handleClearBackground}
            >
              清除
            </Button>
          )}
          {backgroundUri && (
            <Button
              type="Secondary"
              containerStyle={[styles.actionButton, styles.actionButtonSpacing]}
              buttonStyle={styles.actionButtonInner}
              onPress={handleOpenCrop}
              isLoading={isCropping}
              disabled={isCropping}
            >
              裁剪
            </Button>
          )}
          <Button
            type="Secondary"
            containerStyle={styles.actionButton}
            buttonStyle={styles.actionButtonInner}
            onPress={handlePickImage}
            isLoading={isPicking}
          >
            {backgroundUri ? '更换' : '选择'}
          </Button>
        </View>
      </View>

      {/* 背景随课表移动开关 */}
      {backgroundUri && (
        <View style={[styles.settingRow]}>
          <Text style={[currentStyle?.text_style, styles.settingLabel]}>
            背景随课表移动
          </Text>
          <Switch
            checked={backgroundScrollable}
            onChange={checked => setBackgroundScrollable(checked)}
            style={{ marginRight: 40 }}
            trackColor={{ false: '#ECEBFF', true: '#C9B7FF' }}
          />
        </View>
      )}

      {/* 遮罩不透明度 */}
      {backgroundUri && (
        <View style={styles.sliderSection}>
          <Text style={[currentStyle?.text_style, styles.sliderTitle]}>
            背景透明度：{localMaskOpacity}%
          </Text>
          <Slider
            value={localMaskOpacity}
            minimumValue={0}
            maximumValue={100}
            step={1}
            onValueChange={handleMaskOpacityChange}
            onSlidingStart={onSliderTouchStart}
            onSlidingComplete={onSliderTouchEnd}
            thumbStyle={styles.sliderThumb}
            style={{ paddingVertical: 8 }}
            minimumTrackTintColor={commonColors.purple}
          />
          <View style={styles.sliderLabelRow}>
            <Text style={[currentStyle?.text_style, styles.sliderLabel]}>
              0%
            </Text>
            <Text style={[currentStyle?.text_style, styles.sliderLabel]}>
              100%
            </Text>
          </View>
        </View>
      )}

      {/* 模糊程度设置 */}
      {backgroundUri && (
        <View style={styles.sliderSection}>
          <Text style={[currentStyle?.text_style, styles.sliderTitle]}>
            模糊程度：{Math.round((localBlurRadius / 30) * 100)}%
          </Text>
          <Slider
            value={localBlurRadius}
            minimumValue={0}
            maximumValue={30}
            step={1}
            onValueChange={handleBlurRadiusChange}
            onSlidingStart={onSliderTouchStart}
            onSlidingComplete={onSliderTouchEnd}
            thumbStyle={styles.sliderThumb}
            style={{ paddingVertical: 8 }}
            minimumTrackTintColor={commonColors.purple}
          />
          <View style={styles.sliderLabelRow}>
            <Text style={[currentStyle?.text_style, styles.sliderLabel]}>
              0%
            </Text>
            <Text style={[currentStyle?.text_style, styles.sliderLabel]}>
              100%
            </Text>
          </View>
        </View>
      )}

      {/* 前景透明度设置 */}
      <View style={styles.sliderSection}>
        <Text style={[currentStyle?.text_style, styles.sliderTitle]}>
          前景透明度：{localOpacity}%
        </Text>
        <Slider
          value={localOpacity}
          minimumValue={0}
          maximumValue={100}
          step={1}
          onValueChange={handleOpacityChange}
          onSlidingStart={onSliderTouchStart}
          onSlidingComplete={onSliderTouchEnd}
          thumbStyle={styles.sliderThumb}
          style={{ paddingVertical: 8 }}
          minimumTrackTintColor={commonColors.purple}
        />
        <View style={styles.sliderLabelRow}>
          <Text style={[currentStyle?.text_style, styles.sliderLabel]}>0%</Text>
          <Text style={[currentStyle?.text_style, styles.sliderLabel]}>
            100%
          </Text>
        </View>
      </View>
      <BackgroundCropModal
        visible={isCropModalVisible}
        uri={cropSourceUri}
        sourceSize={backgroundSourceSize}
        aspectRatio={cropAspectRatio}
        modeLabel={backgroundScrollable ? '随课表移动' : '固定屏幕'}
        confirming={isCropping}
        initialCrop={currentCropRect}
        onCancel={() => setIsCropModalVisible(false)}
        onConfirm={handleCropConfirm}
      />
    </ThemeBasedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 18,
    paddingLeft: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    marginRight: 40,
  },
  actionButton: {
    width: 60,
    height: 30,
  },
  actionButtonInner: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 0,
    height: 30,
  },
  actionButtonSpacing: {
    marginRight: 10,
  },
  previewSection: {
    marginHorizontal: 40,
    gap: 8,
  },
  previewTitle: {
    fontSize: 16,
    paddingTop: 8,
    opacity: 0.7,
  },
  previewWrapper: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: COURSE_ITEM_WIDTH * 3,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewBackground: {
    width: '100%',
    height: '100%',
  },
  previewBlurCanvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  previewContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 12,
  },
  previewCourse: {
    // flex: 1,
    width: COURSE_ITEM_WIDTH,
  },
  previewPlaceholder: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(147, 121, 246, 0.1)',
    alignItems: 'center',
  },
  previewPlaceholderText: {
    fontSize: 14,
  },
  sliderSection: {
    paddingHorizontal: 40,
    gap: 4,
  },
  sliderTitle: {
    fontSize: 18,
  },
  sliderThumb: {
    backgroundColor: commonColors.purple,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 16,
    paddingLeft: 40,
    paddingTop: 8,
    opacity: 0.7,
  },
  layoutButtonGroup: {
    height: 120,
    marginHorizontal: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  layoutButton: {
    paddingVertical: 16,
  },
  layoutButtonContainer: {
    flex: 1,
  },
  layoutButtonSelected: {
    backgroundColor: 'rgba(147, 121, 246, 0.08)',
  },
  layoutButtonContent: {
    alignItems: 'center',
    gap: 10,
  },
  layoutPreview: {
    width: 120,
    height: 80,
  },
  layoutLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  layoutLabelDark: {
    color: '#aaa',
  },
  layoutLabelSelected: {
    color: '#9379F6',
  },
});
