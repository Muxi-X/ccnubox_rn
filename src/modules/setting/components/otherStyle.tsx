import { Slider, Switch } from '@ant-design/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import Button from '@/components/button';
import Toast from '@/components/toast';
import ThemeBasedView from '@/components/view';

import useCourseTableAppearance from '@/store/courseTableAppearance';
import useThemeBasedComponents from '@/store/themeBasedComponents';
import useVisualScheme from '@/store/visualScheme';

import { COURSE_ITEM_WIDTH, daysOfWeek } from '@/constants/courseTable';
import { CourseTransferType } from '@/modules/courseTable/components/courseTable/type';

const PREVIEW_COURSE_DATA: CourseTransferType = {
  id: 'preview',
  courseName: '示例课程',
  teacher: '张老师',
  classroom: 'A101',
  timeSpan: 2,
  rowIndex: 0,
  colIndex: 0,
  date: daysOfWeek[0],
  isThisWeek: true,
  week_duration: '1-16周',
  credit: 3,
  class_when: '1-2',
  weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  is_official: true,
};

export default function OtherStyle() {
  const { currentStyle, themeName } = useVisualScheme();
  const {
    backgroundUri,
    backgroundMode,
    foregroundOpacity,
    backgroundMaskEnabled,
    setBackgroundUri,
    setForegroundOpacity,
    setBackgroundMaskEnabled,
  } = useCourseTableAppearance();

  const CourseItem = useThemeBasedComponents(
    state => state.CurrentComponents?.CourseItem
  );

  const [isPicking, setIsPicking] = useState(false);
  // 使用本地 state 存储滑块的临时值，减少 store 更新频率
  const [localOpacity, setLocalOpacity] = useState(foregroundOpacity);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const renderSettingRow = (
    label: string,
    right: React.ReactNode,
    extraStyle?: ViewStyle
  ) => (
    <View style={[styles.settingRow, extraStyle]}>
      <Text style={[currentStyle?.text_style, styles.settingLabel]}>
        {label}
      </Text>
      {right}
    </View>
  );

  // 同步 store 的值到本地 state
  useEffect(() => {
    setLocalOpacity(foregroundOpacity);
  }, [foregroundOpacity]);

  const previewCourse = CourseItem ? (
    <CourseItem {...PREVIEW_COURSE_DATA} />
  ) : (
    <View style={styles.previewPlaceholder}>
      <Text style={[currentStyle?.text_style, styles.previewPlaceholderText]}>
        示例课程
      </Text>
    </View>
  );

  const renderPreviewContent = () => (
    <View style={styles.previewContent}>
      <View style={[styles.previewCourse, { opacity: localOpacity }]}>
        {previewCourse}
      </View>
    </View>
  );

  const renderPreview = () => {
    if (!backgroundUri) {
      return renderPreviewContent();
    }

    const maskOpacity = localOpacity * 0.5;
    const maskColor =
      themeName === 'dark'
        ? `rgba(0, 0, 0, ${maskOpacity})`
        : `rgba(255, 255, 255, ${maskOpacity})`;

    return (
      <ImageBackground
        source={{ uri: backgroundUri }}
        style={styles.previewBackground}
        imageStyle={{ resizeMode: backgroundMode }}
      >
        {backgroundMaskEnabled && (
          <View style={[styles.previewMask, { backgroundColor: maskColor }]} />
        )}
        {renderPreviewContent()}
      </ImageBackground>
    );
  };

  const handlePickImage = async () => {
    try {
      setIsPicking(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          text: '需要相册权限才能选择背景图片',
          icon: 'fail',
        });
        setIsPicking(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
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

  const handleOpacityChange = (value: number) => {
    // 立即更新本地 state 以保持 UI 响应
    setLocalOpacity(value);

    // 清除之前的定时器
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    // 延迟更新 store，减少更新频率
    updateTimerRef.current = setTimeout(() => {
      setForegroundOpacity(value);
      updateTimerRef.current = null;
    }, 100);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  return (
    <ThemeBasedView style={styles.container}>
      {/* 选择背景图片 */}
      {renderSettingRow(
        '课表背景',
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
      )}

      {/* 实时预览 */}
      <View style={styles.previewSection}>
        <Text style={[currentStyle?.text_style, styles.previewTitle]}>
          预览效果
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

      {/* 背景遮罩开关 */}
      {backgroundUri &&
        renderSettingRow(
          '背景遮罩',
          <Switch
            checked={backgroundMaskEnabled}
            onChange={setBackgroundMaskEnabled}
            style={styles.switch}
          />,
          styles.settingRowSpacing
        )}

      {/* 前景透明度设置 */}
      <View style={styles.sliderSection}>
        <Text style={[currentStyle?.text_style, styles.sliderTitle]}>
          前景透明度：{Math.round(localOpacity * 100)}%
        </Text>
        <Slider
          value={localOpacity}
          min={0}
          max={1}
          step={0.01}
          onChange={handleOpacityChange}
          style={{ paddingVertical: 0 }}
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
    marginRight: 10,
  },
  actionButton: {
    width: 100,
    borderRadius: 10,
  },
  actionButtonSpacing: {
    marginRight: 10,
  },
  previewSection: {
    marginTop: 30,
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
  previewMask: {
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
  previewCourse: {
    width: COURSE_ITEM_WIDTH * 1.5,
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
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    fontSize: 14,
  },
  switch: {
    marginRight: 20,
  },
});
