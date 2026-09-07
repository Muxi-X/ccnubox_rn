import { makeImageFromView } from '@shopify/react-native-skia';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library/legacy';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import ThemeChangeText from '@/components/text';
import Toast from '@/components/toast';
import { PERMISSION_PURPOSES } from '@/constants/PERMISSIONS';
import {
  COURSE_COLLAPSE,
  COURSE_HEADER_HEIGHT,
  COURSE_ITEM_HEIGHT,
  COURSE_ITEM_WIDTH,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  TIME_WIDTH,
} from '@/constants/SCHEDULE';
import {
  CourseTableBackground,
  useCourseTableBackgroundImage,
} from '@/modules/courseTable/components/CourseTableBackground';
import { buildTimetableLayout } from '@/modules/courseTable/layout';
import useCourseTableAppearance from '@/store/courseTableAppearance';
import useVisualScheme from '@/store/visualScheme';
import { commonColors } from '@/styles/common';
import globalEventBus from '@/utils/eventBus';
import { requestPermission } from '@/utils/requestPermission';

import CourseContent from './CourseContent';
import { StickyBottom } from './StickyBottom';
import { StickyLeft } from './StickyLeft';
import { StickyTop } from './StickyTop';
import TimetableScrollView from './TimetableScrollView';
import type { CourseTableProps } from './type';

const Schedule: React.FC<CourseTableProps> = ({
  data,
  currentWeek,
  onTimetableRefresh,
}) => {
  // 是否为刷新状态
  const [_, setIsFetching] = useState<boolean>(false);
  const [snapshot, setSnapShot] = useState(false);
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const themeName = useVisualScheme(state => state.themeName);
  const {
    backgroundUri,
    backgroundMode,
    backgroundScrollable = true,
    foregroundOpacity,
    backgroundMaskOpacity,
    backgroundBlurRadius,
  } = useCourseTableAppearance();
  const [viewportSize, setViewportSize] = useState<{
    width: number;
    height: number;
  }>(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });
  const imageRef = useRef<View>(null);
  // 完整课表内容的引用
  const fullTableRef = useRef<View>(null);

  const backgroundImage = useCourseTableBackgroundImage(backgroundUri);
  const normalizedForegroundOpacity = (100 - foregroundOpacity) / 100;

  const renderBackgroundContent = (
    children: React.ReactNode,
    style?: StyleProp<ViewStyle>
  ) => {
    const flattenedStyle = (StyleSheet.flatten(style) || {}) as ViewStyle;
    const baseStyle: ViewStyle = { ...flattenedStyle };

    if (baseStyle.position !== 'absolute' && baseStyle.flex === undefined) {
      baseStyle.flex = 1;
    }

    if (!backgroundUri) {
      return (
        <View
          style={[
            baseStyle,
            {
              backgroundColor: currentStyle?.background_style?.backgroundColor,
            },
          ]}
        >
          {children}
        </View>
      );
    }
    const width = (baseStyle.width as number) || 0;
    const height = (baseStyle.height as number) || 0;

    return (
      <View style={[baseStyle, { backgroundColor: 'transparent' }]}>
        <CourseTableBackground
          uri={backgroundUri}
          image={backgroundImage}
          mode={backgroundMode}
          maskOpacity={backgroundMaskOpacity}
          blurRadius={backgroundBlurRadius}
          width={width}
          height={height}
          style={{
            position: 'absolute',
            width: width || '100%',
            height: height || '100%',
          }}
        />
        {children}
      </View>
    );
  };

  const isSavingImageRef = useRef(false);

  const onSaveImageAsync = async () => {
    if (isSavingImageRef.current) {
      return;
    }
    isSavingImageRef.current = true;
    try {
      const hasPermission = await requestPermission({
        getPermission: () => MediaLibrary.getPermissionsAsync(true),
        isGranted: permission => permission.granted,
        purpose: PERMISSION_PURPOSES.saveCourseTable,
        requestPermission: () => MediaLibrary.requestPermissionsAsync(true),
      });
      if (!hasPermission) {
        Toast.show({
          text: '需要相册权限才能保存截图',
          icon: 'fail',
        });
        isSavingImageRef.current = false;
        return;
      }
      setSnapShot(true);
      // 确保截图前视图已完全渲染
      setTimeout(async () => {
        try {
          // 将滚动位置重置到顶部
          globalEventBus.emit('ResetScrollPosition');

          // 给予足够的时间让视图完全渲染
          await new Promise(resolve => setTimeout(resolve, 250));

          let snapshotImage = null;
          try {
            if (fullTableRef.current) {
              snapshotImage = await makeImageFromView(
                fullTableRef as RefObject<View>
              );
            }
          } catch {
            // 忽略初次获取失败，稍后重试
          }

          if (!snapshotImage) {
            await new Promise(resolve => setTimeout(resolve, 200));
            try {
              if (fullTableRef.current) {
                snapshotImage = await makeImageFromView(
                  fullTableRef as RefObject<View>
                );
              }
            } catch (err) {
              Toast.show({ text: `截图失败：${err}`, icon: 'fail' });
              return;
            }
          }

          if (!snapshotImage) {
            Toast.show({
              text: '截图失败',
              icon: 'fail',
            });
            return;
          }

          const data = snapshotImage.encodeToBase64();
          const uri = `data:image/png;base64,${data}`;

          const manipulateResult = await ImageManipulator.manipulateAsync(
            uri,
            [],
            {
              compress: 1,
              format: ImageManipulator.SaveFormat.PNG,
            }
          );

          if (manipulateResult && manipulateResult.uri) {
            await MediaLibrary.createAssetAsync(manipulateResult.uri);
            Toast.show({
              text: '截图成功',
              icon: 'success',
            });
          } else {
            Toast.show({
              text: '截图保存失败',
              icon: 'fail',
            });
          }
        } catch (error) {
          Toast.show({ text: `截图失败：${error}`, icon: 'fail' });
        } finally {
          setSnapShot(false);
          isSavingImageRef.current = false;
        }
      }, 400);
    } catch (e) {
      Toast.show({ text: `截图失败：${e}`, icon: 'fail' });
      setSnapShot(false);
      isSavingImageRef.current = false;
    }
  };

  const onSaveImageAsyncRef = useRef(onSaveImageAsync);
  onSaveImageAsyncRef.current = onSaveImageAsync;

  useEffect(() => {
    const handler = () => onSaveImageAsyncRef.current();
    globalEventBus.on('SaveImageShot', handler);

    return () => {
      globalEventBus.off('SaveImageShot', handler);
    };
  }, []);

  const { timetableMatrix, courses, visibleIds } = React.useMemo(
    () => buildTimetableLayout(data, currentWeek),
    [data, currentWeek]
  );

  // 内容部分
  const renderTimetableContent = (keyPrefix = '') => (
    <View
      style={[
        styles.courseWrapperStyle,
        {
          backgroundColor: backgroundUri
            ? 'transparent'
            : currentStyle?.background_style?.backgroundColor,
        },
      ]}
    >
      {timetableMatrix.map((row, rowIndex: number) => (
        <View key={`${keyPrefix}row-${rowIndex}`} style={styles.row}>
          {row.map(
            (
              subject: { classname: string; timeSpan: number } | null,
              colIndex: number
            ) => (
              <View
                key={`${keyPrefix}cell-${colIndex}`}
                style={[
                  styles.cell,
                  currentStyle?.schedule_border_style,
                  {
                    // 左侧固定栏和右侧内容下划线根据 collapse 确定比例关系
                    // 例如：默认 collapse 为2，则代表默认 timeslot 隔2个单元出现下划线
                    borderBottomWidth: (rowIndex + 1) % COURSE_COLLAPSE ? 0 : 1,
                  },
                ]}
              />
            )
          )}
        </View>
      ))}
      {/* 课程内容 */}
      {courses.map(item => (
        <CourseContent
          visibleIds={visibleIds}
          key={`${keyPrefix}${item.id}`}
          {...item}
          originalData={data}
          currentWeek={currentWeek}
        />
      ))}
    </View>
  );

  // 计算完整课表的尺寸
  const fullTableWidth = TIME_WIDTH + COURSE_ITEM_WIDTH * DAYS_OF_WEEK.length;
  const fullTableHeight =
    COURSE_HEADER_HEIGHT + COURSE_ITEM_HEIGHT * TIME_SLOTS.length;

  const tableBackgroundColor =
    currentStyle?.background_style?.backgroundColor ||
    (themeName === 'light' ? '#FFFFFF' : '#1E1E1E');

  // 创建完整课表内容的视图，用于截图
  const fullTableContent = (
    <View style={styles.fullTableWrapper} pointerEvents="none">
      <View
        ref={fullTableRef}
        collapsable={false}
        style={{
          width: fullTableWidth,
          height: fullTableHeight,
          backgroundColor: tableBackgroundColor,
          overflow: 'hidden',
        }}
      >
        {/* 截图不传入 Skia image，保持原生 Image 背景路径。 */}
        {backgroundUri && (
          <CourseTableBackground
            uri={backgroundUri}
            mode={backgroundMode}
            maskOpacity={backgroundMaskOpacity}
            blurRadius={backgroundBlurRadius}
            width={fullTableWidth}
            height={fullTableHeight}
            style={StyleSheet.absoluteFill}
          />
        )}
        {/* 前景内容层 */}
        <View
          style={{
            width: fullTableWidth,
            height: fullTableHeight,
            opacity: normalizedForegroundOpacity,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {/* 左上角空白区域 */}
            <View
              style={{
                width: TIME_WIDTH,
                height: COURSE_HEADER_HEIGHT,
                backgroundColor: backgroundUri
                  ? 'transparent'
                  : currentStyle?.schedule_item_background_style
                      ?.backgroundColor ||
                    (themeName === 'light'
                      ? commonColors.lightGray
                      : commonColors.black),
              }}
            />
            {/* 顶部周标题 */}
            <StickyTop />
          </View>
          <View style={{ flexDirection: 'row' }}>
            {/* 左侧时间栏 */}
            <View>
              <StickyLeft />
            </View>
            {/* 课表内容 */}
            {data ? (
              renderTimetableContent('snapshot-')
            ) : (
              <ThemeChangeText>正在获取课表...</ThemeChangeText>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const timetableForeground = (
    <View style={[styles.container, { opacity: normalizedForegroundOpacity }]}>
      <TimetableScrollView
        // 上方导航栏
        stickyTop={<StickyTop />}
        ref={imageRef}
        collapsable={false}
        cornerStyle={{
          backgroundColor: backgroundUri
            ? 'transparent'
            : currentStyle?.schedule_item_background_style?.backgroundColor ||
              (themeName === 'light'
                ? commonColors.lightGray
                : commonColors.black),
        }}
        onRefresh={async (handleSuccess, handleFail) => {
          try {
            setIsFetching(true);
            // onTimetableRefresh returns a Promise so we need to await it
            await onTimetableRefresh(true);
            handleSuccess();
          } catch {
            //console.error('刷新失败:', error);
            handleFail();
          } finally {
            setIsFetching(false);
          }
        }}
        // 学霸也是要睡觉的 ！！！！！！
        stickyBottom={<StickyBottom />}
        // 左侧时间栏
        stickyLeft={<StickyLeft />}
        style={{ flex: 1 }}
        backgroundLayer={
          backgroundScrollable
            ? renderBackgroundContent(
                <View style={styles.scrollBackgroundFill} />,
                styles.scrollBackground
              )
            : undefined
        }
      >
        {/* 内容部分 (课程表) */}
        {data ? (
          renderTimetableContent('main-')
        ) : (
          <ThemeChangeText>正在获取课表...</ThemeChangeText>
        )}
      </TimetableScrollView>
    </View>
  );

  const fixedBackground = backgroundUri && !backgroundScrollable && (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <CourseTableBackground
        uri={backgroundUri}
        image={backgroundImage}
        mode={backgroundMode}
        maskOpacity={backgroundMaskOpacity}
        blurRadius={backgroundBlurRadius}
        width={viewportSize.width}
        height={viewportSize.height}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );

  const rootStyle = [
    styles.root,
    !backgroundUri && {
      backgroundColor: currentStyle?.background_style?.backgroundColor,
    },
  ];

  return (
    <View
      style={rootStyle}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        setViewportSize({ width, height });
      }}
    >
      {snapshot && fullTableContent}
      {fixedBackground}
      {timetableForeground}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    overflow: 'visible', // 修改为visible以确保内容不被裁剪
    paddingBottom: 20,
  },
  fullTableWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -100,
  },
  fullTableBackground: {},
  courseWrapperStyle: {
    position: 'relative',
    width: COURSE_ITEM_WIDTH * DAYS_OF_WEEK.length,
    height: COURSE_ITEM_HEIGHT * TIME_SLOTS.length,
    overflow: 'visible', // 修改为visible以确保内容不被裁剪
  },
  scrollBackground: {
    position: 'absolute',
    top: -COURSE_HEADER_HEIGHT,
    left: -TIME_WIDTH,
    width: TIME_WIDTH + COURSE_ITEM_WIDTH * DAYS_OF_WEEK.length,
    height: COURSE_HEADER_HEIGHT + COURSE_ITEM_HEIGHT * TIME_SLOTS.length + 80,
    zIndex: -2,
  },
  scrollBackgroundFill: {
    flex: 1,
  },
  timeSideBar: {
    width: TIME_WIDTH,
    flexGrow: 0,
    flexShrink: 0,
  },
  weekBlock: {
    width: TIME_WIDTH,
    height: COURSE_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: '#E1E2F1',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    position: 'relative',
    width: COURSE_ITEM_WIDTH, // 必须与 headerCell 的宽度保持一致
    height: COURSE_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRightWidth: 1,
    zIndex: 0,
  },
});

export default Schedule;
