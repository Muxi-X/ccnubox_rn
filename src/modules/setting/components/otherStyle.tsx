import { ButtonGroup } from '@rneui/themed';
import {
  BackdropBlur,
  Canvas,
  Image as SkImage,
  Skia,
  SkImage as SkImageType,
  useImage,
} from '@shopify/react-native-skia';
import * as ImagePicker from 'expo-image-picker';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/button';
import Slider from '@/components/slider';
import Toast from '@/components/toast';
import { default as ThemeBasedView } from '@/components/view';

import useCourseTableAppearance from '@/store/courseTableAppearance';
import useVisualScheme from '@/store/visualScheme';

import BaseLightImage from '@/assets/images/theme/base.png';
import BaseDarkImage from '@/assets/images/theme/baseDark.png';
import IosLightImage from '@/assets/images/theme/ios.png';
import IosDarkImage from '@/assets/images/theme/iosDark.png';
import { COURSE_ITEM_WIDTH, DAYS_OF_WEEK } from '@/constants/SCHEDULE';
import { SENSITIVE_PERMISSION_PURPOSES } from '@/constants/SENSITIVE_PERMISSIONS';
import { CourseTransferType } from '@/modules/courseTable/components/courseTable/type';
import { commonColors } from '@/styles/common';
import { componentMap } from '@/themeBasedComponents';
import { runSensitiveAction } from '@/utils/requestSensitivePermission';

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
    backgroundMode,
    foregroundOpacity,
    backgroundMaskOpacity,
    backgroundBlurRadius,
    setBackgroundUri,
    setForegroundOpacity,
    setBackgroundMaskOpacity,
    setBackgroundBlurRadius,
  } = useCourseTableAppearance();

  const CourseItem = componentMap?.[layoutName].CourseItem;

  const [isPicking, setIsPicking] = useState(false);
  // 使用本地 state 存储滑块的临时值，减少 store 更新频率
  const [localOpacity, setLocalOpacity] = useState(foregroundOpacity);
  const [localBlurRadius, setLocalBlurRadius] = useState(backgroundBlurRadius);
  const [localMaskOpacity, setLocalMaskOpacity] = useState(
    backgroundMaskOpacity
  );
  const opacityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maskTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 背景图加载 — 与课表实际渲染保持一致
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
        const data = await Skia.Data.fromURI(backgroundUri);
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

  const backgroundImage = loadedBackgroundImage || backgroundImageFromHook;

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

    if (!backgroundUri || !backgroundImage) {
      return (
        <View style={styles.previewContent}>
          {renderCoursePreview(normalizedOpacity)}
        </View>
      );
    }

    return (
      <View style={styles.previewBackground}>
        {/* 与课表实际渲染完全一致：Canvas 绘制背景图 + 模糊 */}
        <Canvas style={styles.previewBlurCanvas}>
          <SkImage
            image={backgroundImage}
            x={0}
            y={0}
            width={COURSE_ITEM_WIDTH * 3}
            height={180}
            fit={backgroundMode === 'cover' ? 'cover' : 'contain'}
            opacity={1 - localMaskOpacity / 100}
          />
          <BackdropBlur blur={localBlurRadius} />
        </Canvas>
        <View style={styles.previewContent}>
          {renderCoursePreview(normalizedOpacity)}
        </View>
      </View>
    );
  };

  const handlePickImage = async () => {
    try {
      setIsPicking(true);
      const result = await runSensitiveAction({
        action: () =>
          ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.9,
          }),
        purpose: SENSITIVE_PERMISSION_PURPOSES.courseTableBackground,
      });

      if (result && !result.canceled && result.assets?.[0]?.uri) {
        setBackgroundUri(result.assets[0].uri);
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

  const handleClearBackground = () => {
    setBackgroundUri(undefined);
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
              style={[
                styles.actionButton,
                styles.actionButtonSpacing,
                currentStyle?.button_style,
              ]}
              onPress={handleClearBackground}
            >
              清除
            </Button>
          )}
          <Button
            style={[styles.actionButton, currentStyle?.button_style]}
            onPress={handlePickImage}
            isLoading={isPicking}
          >
            {backgroundUri ? '更换' : '选择'}
          </Button>
        </View>
      </View>

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
    </ThemeBasedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
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
  settingRowSpacing: {
    marginTop: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    marginRight: 40,
  },
  actionButton: {
    width: 60,
    height: 30,
    borderRadius: 10,
  },
  actionButtonSpacing: {
    marginRight: 10,
  },
  previewSection: {
    marginBottom: 20,
    marginHorizontal: 40,
  },
  previewTitle: {
    fontSize: 16,
    marginBottom: 12,
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
    marginTop: 20,
    paddingHorizontal: 40,
  },
  sliderTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  sliderThumb: {
    backgroundColor: commonColors.purple,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 16,
    paddingLeft: 40,
    marginBottom: 12,
    opacity: 0.7,
  },
  layoutButtonGroup: {
    height: 120,
    marginBottom: 20,
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
