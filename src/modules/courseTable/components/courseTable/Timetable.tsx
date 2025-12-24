import {
  Canvas,
  makeImageFromView,
  Paint,
  Rect,
  Skia,
  Image as SkImage,
  SkImage as SkImageType,
  useCanvasRef,
  useImage,
} from '@shopify/react-native-skia';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import React, {
  RefObject,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import ScrollableView from '@/components/scrollView';
import ThemeChangeText from '@/components/text';
import Toast from '@/components/toast';

import useCourseTableAppearance from '@/store/courseTableAppearance';
import useVisualScheme from '@/store/visualScheme';

import {
  COURSE_HEADER_HEIGHT,
  COURSE_ITEM_HEIGHT,
  COURSE_ITEM_WIDTH,
  courseCollapse,
  daysOfWeek,
  TIME_WIDTH,
  timeSlots,
} from '@/constants/courseTable';
import { commonColors } from '@/styles/common';
import globalEventBus from '@/utils/eventBus';

import CourseContent from './CourseContent';
import { StickyBottom } from './StickyBottom';
import { StickyLeft } from './StickyLeft';
import { StickyTop } from './StickyTop';
import { CourseTableProps, CourseTransferType, courseType } from './type';

const Timetable: React.FC<CourseTableProps> = ({
  data,
  currentWeek,
  onTimetableRefresh,
}) => {
  // 是否为刷新状态
  const [_, setIsFetching] = useState<boolean>(false);
  const [snapshot, setSnapShot] = useState(false);
  const { currentStyle, themeName } = useVisualScheme(
    ({ currentStyle, themeName }) => ({ currentStyle, themeName })
  );
  const {
    backgroundUri,
    backgroundMode,
    foregroundOpacity,
    backgroundMaskEnabled,
  } = useCourseTableAppearance();
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef<View>(null);
  // 完整课表内容的引用
  const fullTableRef = useRef<View>(null);
  // Canvas引用，用于截图背景
  const canvasRef = useCanvasRef();
  // 合成Canvas引用，用于合成背景和前景
  const compositeCanvasRef = useCanvasRef();
  // 前景截图的Skia Image
  const [foregroundImage, setForegroundImage] = useState<ReturnType<
    typeof useImage
  > | null>(null);

  // 使用useImage加载背景图（用于普通显示）
  const backgroundImageFromHook = useImage(backgroundUri || '');
  // 手动加载的背景图（用于截图时确保已加载）
  const [loadedBackgroundImage, setLoadedBackgroundImage] =
    useState<SkImageType | null>(null);

  // 当backgroundUri变化时，手动加载图片
  useEffect(() => {
    const loadImage = async () => {
      if (!backgroundUri) {
        setLoadedBackgroundImage(null);
        return;
      }
      try {
        const data = await Skia.Data.fromURI(backgroundUri);
        if (data) {
          const image = Skia.Image.MakeImageFromEncoded(data);
          setLoadedBackgroundImage(image);
        }
      } catch (error) {
        setLoadedBackgroundImage(null);
      }
    };
    loadImage();
  }, [backgroundUri]);

  // 优先使用手动加载的图片，否则使用hook加载的
  const backgroundImage = loadedBackgroundImage || backgroundImageFromHook;

  const renderBackgroundContent = (
    children: React.ReactNode,
    style?: StyleProp<ViewStyle>
  ) => {
    const flattenedStyle = (StyleSheet.flatten(style) || {}) as ViewStyle;
    const baseStyle: ViewStyle = { ...flattenedStyle };

    if (baseStyle.position !== 'absolute' && baseStyle.flex === undefined) {
      baseStyle.flex = 1;
    }

    if (!backgroundUri || !backgroundImage) {
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
    const maskOpacity = foregroundOpacity * 0.5;
    const maskColor =
      themeName === 'dark'
        ? `rgba(0, 0, 0, ${maskOpacity})`
        : `rgba(255, 255, 255, ${maskOpacity})`;

    const width = (baseStyle.width as number) || 0;
    const height = (baseStyle.height as number) || 0;

    return (
      <View style={[baseStyle, { backgroundColor: 'transparent' }]}>
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
            fit={backgroundMode === 'cover' ? 'cover' : 'contain'}
          />
          {/* 遮罩层 */}
          {backgroundMaskEnabled && (
            <Rect x={0} y={0} width={width} height={height}>
              <Paint color={maskColor} />
            </Rect>
          )}
        </Canvas>
        {children}
      </View>
    );
  };

  const onSaveImageAsync = async () => {
    try {
      // 在真正需要使用权限时才请求
      if (status?.status !== 'granted') {
        const permissionResult = await requestPermission();
        if (permissionResult.status !== 'granted') {
          Toast.show({
            text: '需要相册权限才能保存截图',
            icon: 'fail',
          });
          return;
        }
      }
      setSnapShot(true);
      // 确保截图前视图已完全渲染
      setTimeout(async () => {
        try {
          // 将滚动位置重置到顶部
          globalEventBus.emit('ResetScrollPosition');

          // 给予时间让滚动位置重置
          await new Promise(resolve => setTimeout(resolve, 100));
          if (backgroundUri) {
            // 先截取前景View
            const fgSnapshot = await makeImageFromView(
              fullTableRef as RefObject<View>
            );

            if (fgSnapshot) {
              // 保存前景图到state，触发合成Canvas重新渲染
              setForegroundImage(fgSnapshot as any);

              // 等待Canvas渲染完成
              await new Promise(resolve => setTimeout(resolve, 200));

              // 截取合成后的Canvas
              if (compositeCanvasRef.current) {
                const compositeSnapshot =
                  await compositeCanvasRef.current.makeImageSnapshotAsync();

                if (compositeSnapshot) {
                  const data = compositeSnapshot.encodeToBase64();
                  const uri = `data:image/png;base64,${data}`;

                  const manipulateResult =
                    await ImageManipulator.manipulateAsync(uri, [], {
                      compress: 1,
                      format: ImageManipulator.SaveFormat.PNG,
                    });

                  if (manipulateResult && manipulateResult.uri) {
                    await MediaLibrary.createAssetAsync(manipulateResult.uri);
                    Toast.show({
                      text: '截图成功',
                      icon: 'success',
                    });
                    setForegroundImage(null);
                    setSnapShot(false);
                    return;
                  }
                }
              }
            }
            setForegroundImage(null);
          }

          // 没有背景图，直接截取View

          const snapshot = await makeImageFromView(
            fullTableRef as RefObject<View>
          );

          if (!snapshot) {
            Toast.show({
              text: '截图失败',
              icon: 'fail',
            });
            setSnapShot(false);
            return;
          }

          const data = snapshot.encodeToBase64();
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
            setSnapShot(false);
          }
        } catch (error) {
          Toast.show({ text: `截图失败：${error}`, icon: 'fail' });
          setSnapShot(false);
          return;
        }
      }, 500); // 给予足够的时间让视图完全渲染
    } catch (e) {
      Toast.show({ text: `截图失败：${e}`, icon: 'fail' });
      setSnapShot(false);
    }
  };

  useEffect(() => {
    globalEventBus.on('SaveImageShot', onSaveImageAsync);

    return () => {
      // globalEventBus.off('SaveImageShot', onSaveImageAsync);
    };
  }, []);

  // 计算课程表内容的memoized值
  const { timetableMatrix, courses, visibleIds } = React.useMemo(() => {
    // 时刻表
    const timetableMatrix: ({
      classname: string;
      timeSpan: number;
    } | null)[][] = timeSlots.map(() => Array(daysOfWeek.length).fill(null));
    const courses: CourseTransferType[] = [];
    // 先按时间槽和日期分组课程
    const coursesBySlot = new Map();
    const idxMap = new Map<string, number>();
    data.forEach((course: courseType, idx: number) => {
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
      idxMap.set(course.id, idx);
      // 计算课程的时间跨度（占几节课）
      const timeSpan = class_when
        .split('-')
        .map(Number)
        .reduce((a: number, b: number) => b - a + 1);

      // 计算课程在课表中的位置
      const rowIndex = Number(class_when.split('-')[0]) - 1; // 第几节课开始
      const colIndex = day - 1; // 周几（0-6，对应周一到周日）
      const key = `${rowIndex}-${colIndex}`; // 生成唯一键，标识时间槽位置

      if (rowIndex !== -1 && colIndex !== -1) {
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
          date: daysOfWeek[colIndex],
          classroom: where,
          rowIndex,
          colIndex,
          weeks,
          isThisWeek: weeks.includes(currentWeek), // 标记是否为当前周的课程
          week_duration,
          credit,
          class_when,
          note,
          is_official,
        });
      }
    });

    // 遍历每个时间槽，选择正确的课程显示
    for (const [key, slotCourses] of coursesBySlot) {
      const [rowIndex, colIndex] = key.split('-').map(Number);

      // 当一个时间槽有多节课时，优先显示当前周的课程
      let courseToShow: CourseTransferType | null = null;

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
      courseToShow = sorted[0] ?? null;

      if (courseToShow) {
        timetableMatrix[rowIndex][colIndex] = {
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
  const content = useDeferredValue(
    React.useMemo(() => {
      return (
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
            <View key={rowIndex} style={styles.row}>
              {row.map(
                (
                  subject: { classname: string; timeSpan: number } | null,
                  colIndex: number
                ) => (
                  <View
                    key={colIndex}
                    style={[
                      styles.cell,
                      currentStyle?.schedule_border_style,
                      {
                        // 左侧固定栏和右侧内容下划线根据 collapse 确定比例关系
                        // 例如：默认 collapse 为2，则代表默认 timeslot 隔2个单元出现下划线
                        borderBottomWidth:
                          (rowIndex + 1) % courseCollapse ? 0 : 1,
                      },
                    ]}
                  ></View>
                )
              )}
            </View>
          ))}
          {/* 课程内容 */}
          {courses.map(item => (
            <CourseContent
              visibleIds={visibleIds}
              key={item.id}
              {...item}
              originalData={data}
              currentWeek={currentWeek}
            />
          ))}
        </View>
      );
    }, [timetableMatrix, courses, visibleIds, currentStyle, backgroundUri])
  );

  // 计算完整课表的尺寸
  const fullTableWidth = TIME_WIDTH + COURSE_ITEM_WIDTH * daysOfWeek.length;
  const fullTableHeight =
    COURSE_HEADER_HEIGHT + COURSE_ITEM_HEIGHT * timeSlots.length;

  // 创建完整课表内容的视图，用于截图
  const fullTableContent = (
    <View style={styles.fullTableWrapper}>
      {/* 合成Canvas - 用于合成背景和前景后截图 */}
      {backgroundUri && backgroundImage && foregroundImage && (
        <Canvas
          ref={compositeCanvasRef}
          style={{
            position: 'absolute',
            width: fullTableWidth,
            height: fullTableHeight,
            zIndex: 10,
          }}
        >
          {/* 背景图片 */}
          <SkImage
            image={backgroundImage}
            x={0}
            y={0}
            width={fullTableWidth}
            height={fullTableHeight}
            fit={backgroundMode === 'cover' ? 'cover' : 'contain'}
          />
          {/* 遮罩层 */}
          {backgroundMaskEnabled && (
            <Rect x={0} y={0} width={fullTableWidth} height={fullTableHeight}>
              <Paint
                color={
                  themeName === 'dark'
                    ? `rgba(0, 0, 0, ${foregroundOpacity * 0.5})`
                    : `rgba(255, 255, 255, ${foregroundOpacity * 0.5})`
                }
              />
            </Rect>
          )}
          {/* 前景内容 */}
          <SkImage
            image={foregroundImage}
            x={0}
            y={0}
            width={fullTableWidth}
            height={fullTableHeight}
            fit="fill"
            opacity={foregroundOpacity}
          />
        </Canvas>
      )}
      {/* 前景内容 - 用于截图 */}
      <View
        ref={fullTableRef}
        collapsable={false}
        style={{
          width: fullTableWidth,
          height: fullTableHeight,
          backgroundColor: 'transparent',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {/* 左上角空白区域 */}
          <View
            style={{
              width: TIME_WIDTH,
              height: COURSE_HEADER_HEIGHT,
              backgroundColor:
                themeName === 'light' ? commonColors.gray : commonColors.black,
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
          {data ? content : <ThemeChangeText>正在获取课表...</ThemeChangeText>}
        </View>
      </View>
    </View>
  );

  const timetableForeground = (
    <View style={[styles.container, { opacity: foregroundOpacity }]}>
      {/* 用于截图的完整课表内容 */}
      {snapshot && fullTableContent}
      <ScrollableView
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
        backgroundLayer={renderBackgroundContent(
          <View style={styles.scrollBackgroundFill} />,
          styles.scrollBackground
        )}
      >
        {/* 内容部分 (课程表) */}
        {data ? content : <ThemeChangeText>正在获取课表...</ThemeChangeText>}
      </ScrollableView>
    </View>
  );

  const rootStyle = [
    styles.root,
    !backgroundUri && {
      backgroundColor: currentStyle?.background_style?.backgroundColor,
    },
  ];

  return <View style={rootStyle}>{timetableForeground}</View>;
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
    zIndex: -100,
  },
  fullTableBackground: {},
  courseWrapperStyle: {
    position: 'relative',
    width: COURSE_ITEM_WIDTH * daysOfWeek.length,
    height: COURSE_ITEM_HEIGHT * timeSlots.length,
    overflow: 'visible', // 修改为visible以确保内容不被裁剪
    zIndex: -1,
  },
  scrollBackground: {
    position: 'absolute',
    top: -COURSE_HEADER_HEIGHT,
    left: -TIME_WIDTH,
    width: TIME_WIDTH + COURSE_ITEM_WIDTH * daysOfWeek.length,
    height: COURSE_HEADER_HEIGHT + COURSE_ITEM_HEIGHT * timeSlots.length,
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
    zIndex: -1,
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

export default Timetable;
