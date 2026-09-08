import {
  BackdropBlur,
  Canvas,
  makeImageFromView,
  Skia,
  Image as SkImage,
  SkImage as SkImageType,
  useImage,
} from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library/legacy';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
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
import useCourseTableAppearance from '@/store/courseTableAppearance';
import useVisualScheme from '@/store/visualScheme';
import { commonColors } from '@/styles/common';
import { getAlphaColor } from '@/utils/color';
import { parseClassWhen } from '@/utils/courseRuntime';
import globalEventBus from '@/utils/eventBus';
import { requestPermission } from '@/utils/requestPermission';

import CourseContent from './CourseContent';
import { StickyBottom } from './StickyBottom';
import { StickyLeft } from './StickyLeft';
import { StickyTop } from './StickyTop';
import TimetableScrollView from './TimetableScrollView';
import { CourseTableProps, CourseTransferType, courseType } from './type';

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

  // 使用useImage加载背景图（用于普通显示）
  const backgroundImageFromHook = useImage(backgroundUri || '');
  // 手动加载的背景图（用于截图时确保已加载）
  const [loadedBackgroundImage, setLoadedBackgroundImage] =
    useState<SkImageType | null>(null);

  // 当backgroundUri变化时，手动加载图片
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
            // ignore
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

  // 优先使用手动加载的图片，否则使用hook加载的
  const backgroundImage = loadedBackgroundImage || backgroundImageFromHook;
  const normalizedForegroundOpacity = (100 - foregroundOpacity) / 100;

  const cornerBackgroundColor = React.useMemo(() => {
    const rawColor =
      currentStyle?.schedule_item_background_style?.backgroundColor ||
      (themeName === 'light' ? commonColors.lightGray : commonColors.black);
    if (!backgroundUri) {
      return rawColor;
    }
    return getAlphaColor(rawColor, 0.2);
  }, [currentStyle?.schedule_item_background_style, themeName, backgroundUri]);

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
    const bgOpacity = 1 - backgroundMaskOpacity / 100;

    const width = (baseStyle.width as number) || 0;
    const height = (baseStyle.height as number) || 0;

    return (
      <View style={[baseStyle, { backgroundColor: 'transparent' }]}>
        {backgroundImage ? (
          <Canvas
            style={{
              position: 'absolute',
              width: width || '100%',
              height: height || '100%',
            }}
          >
            {/* 背景图片 */}
            <SkImage
              image={backgroundImage}
              x={0}
              y={0}
              width={width}
              height={height}
              fit={
                backgroundMode === 'cover'
                  ? 'cover'
                  : backgroundMode === 'contain'
                    ? 'contain'
                    : 'fill'
              }
              opacity={bgOpacity}
            />
            {/* 高斯模糊 */}
            {backgroundBlurRadius > 0 && (
              <BackdropBlur blur={backgroundBlurRadius} />
            )}
          </Canvas>
        ) : (
          <Image
            source={{ uri: backgroundUri }}
            style={{
              position: 'absolute',
              width: width || '100%',
              height: height || '100%',
              opacity: bgOpacity,
            }}
            resizeMode={
              backgroundMode === 'cover'
                ? 'cover'
                : backgroundMode === 'contain'
                  ? 'contain'
                  : 'stretch'
            }
            blurRadius={backgroundBlurRadius}
          />
        )}
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

  // 计算课程表内容的memoized值
  const { timetableMatrix, courses, visibleIds } = React.useMemo(() => {
    // 时刻表
    const timetableMatrix: ({
      classname: string;
      timeSpan: number;
    } | null)[][] = TIME_SLOTS.map(() => Array(DAYS_OF_WEEK.length).fill(null));
    const courses: CourseTransferType[] = [];
    // 先按时间槽和日期分组课程
    const coursesBySlot = new Map();
    const idxMap = new Map<string, number>();
    (Array.isArray(data) ? data : []).forEach(
      (course: courseType, idx: number) => {
        const {
          id,
          day,
          teacher,
          where,
          class_when,
          classname,
          weeks,
          week_duration,
          credit,
          note,
          is_official,
        } = course;
        const parsedRange = parseClassWhen(class_when);
        const safeDay = Number(day);
        if (
          !parsedRange ||
          !Number.isInteger(safeDay) ||
          safeDay < 1 ||
          safeDay > DAYS_OF_WEEK.length
        ) {
          return;
        }

        idxMap.set(course.id, idx);
        // 计算课程的时间跨度（占几节课）
        const timeSpan = parsedRange.endSection - parsedRange.startSection + 1;

        // 计算课程在课表中的位置
        const rowIndex = parsedRange.startSection - 1; // 第几节课开始
        const colIndex = safeDay - 1; // 周几（0-6，对应周一到周日）
        const key = `${rowIndex}-${colIndex}`; // 生成唯一键，标识时间槽位置

        if (
          rowIndex >= 0 &&
          rowIndex < timetableMatrix.length &&
          colIndex >= 0 &&
          colIndex < DAYS_OF_WEEK.length
        ) {
          // 如果该时间槽还没有课程，创建一个空数组
          if (!coursesBySlot.has(key)) {
            coursesBySlot.set(key, []);
          }

          // 将课程添加到对应的时间槽中
          coursesBySlot.get(key).push({
            id,
            courseName: classname,
            timeSpan,
            teacher,
            date: DAYS_OF_WEEK[colIndex],
            classroom: where,
            rowIndex,
            colIndex,
            weeks: Array.isArray(weeks) ? weeks : [],
            isThisWeek: Array.isArray(weeks) && weeks.includes(currentWeek), // 标记是否为当前周的课程
            week_duration,
            credit,
            class_when,
            note,
            is_official,
          });
        }
      }
    );

    // 遍历每个时间槽，选择正确的课程显示
    for (const [key, slotCourses] of coursesBySlot) {
      const [rowIndex, colIndex] = key.split('-').map(Number);

      // 当一个时间槽有多节课时，优先显示当前周的课程
      const getPriority = (c: CourseTransferType) => {
        const idx = idxMap.get(c.id) || 0; // 查找序列，越往后越大
        const base = (c.isThisWeek ? 2 : 0) + (!c.is_official ? 1 : 0); // 3/2/1/0
        return base * 100 + idx; // 乘100是因为有时idx的影响太大了，覆盖了base，而且后面加大比重直接改100方便
      };
      const sorted = slotCourses
        .slice()
        .sort(
          (a: CourseTransferType, b: CourseTransferType) =>
            getPriority(b) - getPriority(a)
        );
      const courseToShow = sorted[0] ?? null;

      if (courseToShow) {
        const row = timetableMatrix[rowIndex];
        if (!row || colIndex < 0 || colIndex >= row.length) continue;

        row[colIndex] = {
          classname: courseToShow.courseName,
          timeSpan: courseToShow.timeSpan,
        };
        courses.push(courseToShow);
      }
    }
    const visibleIds = courses.map(c => c.id);
    return { timetableMatrix, courses, visibleIds };
  }, [data, currentWeek]); // 只在data或currentWeek改变时重新计算，返回memoized结果

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
        {/* 背景层：若设置了背景图片则铺满底层 */}
        {backgroundUri && (
          <Image
            source={{ uri: backgroundUri }}
            style={[
              StyleSheet.absoluteFill,
              { opacity: 1 - backgroundMaskOpacity / 100 },
            ]}
            resizeMode={
              backgroundMode === 'cover'
                ? 'cover'
                : backgroundMode === 'contain'
                  ? 'contain'
                  : 'stretch'
            }
            blurRadius={backgroundBlurRadius}
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
              style={[
                styles.corner,
                currentStyle?.schedule_border_style,
                {
                  backgroundColor: cornerBackgroundColor,
                },
              ]}
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
        cornerStyle={[
          styles.corner,
          currentStyle?.schedule_border_style,
          {
            backgroundColor: cornerBackgroundColor,
          },
        ]}
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
      {backgroundImage ? (
        <Canvas style={StyleSheet.absoluteFill}>
          <SkImage
            image={backgroundImage}
            x={0}
            y={0}
            width={viewportSize.width}
            height={viewportSize.height}
            fit={
              backgroundMode === 'cover'
                ? 'cover'
                : backgroundMode === 'contain'
                  ? 'contain'
                  : 'fill'
            }
            opacity={1 - backgroundMaskOpacity / 100}
          />
          {backgroundBlurRadius > 0 && (
            <BackdropBlur blur={backgroundBlurRadius} />
          )}
        </Canvas>
      ) : (
        <Image
          source={{ uri: backgroundUri }}
          style={[
            StyleSheet.absoluteFill,
            { opacity: 1 - backgroundMaskOpacity / 100 },
          ]}
          resizeMode={
            backgroundMode === 'cover'
              ? 'cover'
              : backgroundMode === 'contain'
                ? 'contain'
                : 'stretch'
          }
          blurRadius={backgroundBlurRadius}
        />
      )}
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
  corner: {
    width: TIME_WIDTH,
    height: COURSE_HEADER_HEIGHT,
    borderRightWidth: 1,
    borderBottomWidth: 1,
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
