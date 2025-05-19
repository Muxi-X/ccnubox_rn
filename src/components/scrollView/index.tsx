import LottieView from 'lottie-react-native';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { commonColors } from '@/styles/common';
import globalEventBus from '@/utils/eventBus';

import Divider from '../divider';
import Toast from '../toast';
import { ScrollableViewProps } from './type';
/** 触发刷新的阈值 */
const REFRESH_THRESHOLD = 100;
/** 最小触发阈值 */
const MIN_THRESHOLD = 20;
/** 下拉刷新回弹动画时间 */
const REFRESH_BACK_ANIMATION_TIME = 500;
const refreshTextMap: Record<RefreshState, string> = {
  pull: '下拉刷新课表',
  pullMore: '继续下拉刷新课表',
  release: '松开即可刷新',
  refreshing: '刷新中...',
};
/**
 * 刷新状态
 * 'pull': 下拉状态
 * 'release': 可释放刷新状态
 * 'refreshing': 正在刷新状态
 */
type RefreshState = 'pull' | 'release' | 'refreshing' | 'pullMore';

const ScrollLikeView = (props: ScrollableViewProps) => {
  const {
    stickyTop,
    stickyLeft,
    children,
    style,
    cornerStyle,
    onRefresh,
    collapsable,
  } = props;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const prevTranslateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  // FIX_ME 此处为两个 sticky 交界处，会覆盖，很丑，目前方式为计算重叠块大小，用一个块覆盖
  const cornerWidth = useSharedValue(0);
  const cornerHeight = useSharedValue(0);
  // 下拉刷新背景高度
  const backHeight = useSharedValue(0);
  const isAtTop = useSharedValue(false);
  // 当前 touchEvent 是否满足触发 refresh 的条件
  // 如果横向滑动太大,则不触发 refresh, 重新 touch 以触发下一次
  const shouldRefresh = useSharedValue(true);
  // 实际内容大小
  const [containerSize, setContainerSize] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  });
  // 容器大小
  const [wrapperSize, setWrapperSize] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  // 使用共享值来控制文字状态，减少重渲染
  const refreshTextState = useSharedValue<RefreshState>('pull');
  const isTriggered = useSharedValue(false); // 是否已触发刷新
  const isRefreshing = useSharedValue(false); // 是否正在刷新中，用于禁用滚动
  const animationRef = useRef<LottieView | null>(null);
  const refreshTextProps = useAnimatedProps(() => {
    return {
      children: refreshTextMap[refreshTextState.value],
    };
  });
  // 监听重置滚动位置的事件
  useEffect(() => {
    const resetScrollPosition = () => {
      // 重置滚动位置到顶部
      translateX.value = 0;
      translateY.value = 0;
    };

    globalEventBus.on('ResetScrollPosition', resetScrollPosition);

    return () => {
      globalEventBus.off('ResetScrollPosition', resetScrollPosition);
    };
  }, []);
  const lottieProgress = () => {
    animationRef.current?.play(90, 110);
  };

  // 监听边界事件
  const onReachTopEnd = () => {
    if (!onRefresh) return;
    /** 收起 refresh 动画 */
    const closeRefresh = () => {
      backHeight.value = withTiming(0, {
        duration: REFRESH_BACK_ANIMATION_TIME,
      });
      // 在动画完成后重置状态
      refreshTextState.value = 'pull';
      // 使用 setTimeout 来延迟动画开始时间
      setTimeout(() => {
        isRefreshing.value = false;
        isAtTop.value = false;
      }, REFRESH_BACK_ANIMATION_TIME); // 减少延迟时间
    };
    onRefresh(
      () => {
        // 请求成功后立即显示提示，提高响应速度
        Toast.show({
          text: '后续学校课表数据可能发生变化 请以教务系统为准',
          icon: 'success',
          duration: 1000,
        });
        closeRefresh();
      },
      () => {
        // 请求失败后立即显示提示，提高响应速度
        Toast.show({
          text: '刷新失败',
          icon: 'fail',
        });
        closeRefresh();
      }
    );
  };
  const animationRefChange = () => {
    animationRef.current?.play(
      (backHeight.value / REFRESH_THRESHOLD) * 110,
      (backHeight.value / REFRESH_THRESHOLD) * 110
    );
  };

  // 处理下拉刷新逻辑 - 优化性能
  const handlePullToRefresh = (event: any) => {
    'worklet';
    // 在刷新状态下不处理下拉刷新，避免高度闪烁
    if (isRefreshing.value) {
      return;
    }
    // 检查是否是向上滑动或者不在顶部
    if (event.translationY <= 0 || translateY.value !== 0) {
      refreshTextState.value = 'pull';
      return;
    }
    // 只有在顶部且向下拉动时才处理刷新
    if (translateY.value === 0 && shouldRefresh.value && startY.value === 0) {
      // 添加阻尼效果，使用更小的系数来减少移动敏感度
      const dampedTranslation = event.translationY * 0.4;
      // 只有当下拉距离超过最小阈值时才显示刷新指示器
      if (dampedTranslation >= MIN_THRESHOLD) {
        isAtTop.value = true;
        const newHeight = Math.min(
          dampedTranslation - MIN_THRESHOLD,
          REFRESH_THRESHOLD
        );
        backHeight.value = newHeight;
        runOnJS(animationRefChange)();
        // 未达到阈值一半, 展示下拉
        if (newHeight < REFRESH_THRESHOLD / 2) {
          refreshTextState.value = 'pull';
          return;
        }
        // 达到阈值一半, 展示继续下拉
        if (
          newHeight >= REFRESH_THRESHOLD / 2 &&
          newHeight < REFRESH_THRESHOLD
        ) {
          refreshTextState.value = 'pullMore';
          return;
        }
        // 当拉动超过阈值时，更新状态为[松手]
        if (newHeight === REFRESH_THRESHOLD) {
          refreshTextState.value = 'release';
          return;
        }
      }
    }
  };

  // 处理刷新完成逻辑 - 优化性能
  const handleRefreshComplete = (event: any) => {
    'worklet';
    // 在刷新状态下不处理手势结束，避免不必要的计算
    if (isRefreshing.value) {
      return;
    }
    // 缓存当前值
    prevTranslateX.value = event.absoluteX;
    shouldRefresh.value = true;

    // 如果是向上滑动，确保刷新提示框高度重置
    if (
      event.translationY <= 0 &&
      backHeight.value > 0 &&
      !isRefreshing.value
    ) {
      // 立即重置高度，不使用动画，避免延迟
      backHeight.value = 0;
      refreshTextState.value = 'pull';
      isTriggered.value = false;
      return;
    }
    if (refreshTextState.value === 'release') {
      // 触发刷新，保持指示器在阈值位置
      // 先设置状态，再设置高度，避免安卓上的闪烁
      refreshTextState.value = 'refreshing';
      // 设置正在刷新状态，禁用滚动
      isRefreshing.value = true;
      isTriggered.value = true;
      runOnJS(lottieProgress)();
      // 使用 runOnJS 在 JS 线程上调用回调，避免阻塞 UI 线程
      runOnJS(onReachTopEnd)();
    } else if (backHeight.value > 0) {
      // 只有当高度大于 0 时才需要重置，避免不必要的更新
      // 重置状态
      refreshTextState.value = 'pull';
      // 使用更短的动画时间，减少延迟感
      backHeight.value = withTiming(0, {
        duration: 400,
      });
      isAtTop.value = false;
      // 确保刷新状态被重置，即使用户取消了刷新
      isRefreshing.value = false;
    }
    isTriggered.value = false;
  };

  // 创建动态手势处理器，在刷新状态下禁用滚动 - 优化性能
  const panGesture = Gesture.Pan()
    .minDistance(2)
    .onStart(() => {
      'worklet';
      // 在刷新状态下不允许开始新的滑动
      if (isRefreshing.value) {
        return;
      }
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate(event => {
      'worklet';

      // 在刷新状态下不处理滑动更新
      if (isRefreshing.value) {
        return;
      }

      // 如果是向上滑动，确保刷新提示框高度重置
      // 这是修复刷新提示框在向上滑动时高度不会还原的关键
      if (
        event.translationY < 0 &&
        backHeight.value > 0 &&
        !isRefreshing.value
      ) {
        backHeight.value = 0;
        if (refreshTextState.value !== 'pull') {
          refreshTextState.value = 'pull';
        }
      }

      // 处理下拉刷新
      handlePullToRefresh(event);
      // 只有启用滚动时才处理滚动
      if (true) {
        const newTranslateX = Math.min(
          0,
          Math.max(
            startX.value + Math.floor(event.translationX),
            wrapperSize.width - containerSize.width
          )
        );

        const newTranslateY = Math.min(
          0,
          Math.max(
            startY.value + Math.floor(event.translationY),
            wrapperSize.height - containerSize.height
          )
        );
        translateX.value = newTranslateX;
        translateY.value = newTranslateY;
      }
    })
    .onEnd(event => {
      'worklet';
      // 在刷新状态下不处理滑动结束
      if (!shouldRefresh.value || isRefreshing.value) {
        return;
      }
      if (wrapperSize.height - translateY.value - containerSize.height >= -60) {
        translateY.value = withTiming(translateY.value + 60);
      }

      handleRefreshComplete(event);
    });
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  }, []);

  // Animated style for content margins
  const contentMarginStyle = useAnimatedStyle(() => {
    return {
      marginLeft: cornerWidth.value,
    };
  }, []);

  // Animated style for corner dimensions
  const defaultCornerStyle = useAnimatedStyle(() => {
    return {
      height: cornerHeight.value,
      width: cornerWidth.value,
    };
  }, []);

  // Animated style for sticky top margin
  const stickyTopMarginStyle = useAnimatedStyle(() => {
    return {
      marginLeft: cornerWidth.value,
    };
  }, []);
  // For the sticky top, we only want horizontal scrolling, not vertical
  const animatedOnlyX = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    zIndex: 10, // Ensure it stays on top
  }));

  // For the sticky left, we only want vertical scrolling, not horizontal
  const animatedOnlyY = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: 9, // Ensure it stays on top but below the corner
  }));
  // For the sticky left, we only want vertical scrolling, not horizontal
  const refreshHeight = useAnimatedStyle(() => ({
    transform: [{ translateY: backHeight.value }],
  }));
  const handleChildLayout = (event: LayoutChangeEvent) => {
    const { layout } = event.nativeEvent;
    setContainerSize(layout);
  };

  // 创建文本状态的动画样式 - 优化性能
  const textOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(backHeight.value, [0, REFRESH_THRESHOLD], [0, 1]),
    };
  }, []);

  return (
    <View
      style={[styles.largeWrapper, style]}
      collapsable={collapsable}
      // 确保内容不被裁剪
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          {
            width: '100%',
            zIndex: -1,
            height: REFRESH_THRESHOLD,
            opacity: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: commonColors.lightPurple,
            overflow: 'hidden',
            alignItems: 'center',
            position: 'absolute',
            elevation: 5,
          },
        ]}
      >
        <LottieView
          source={require('@/assets/animation/renovate.json')}
          style={[styles.lottieAnimation]}
          loop={true}
          ref={animationRef}
        />
        <Animated.Text
          style={[styles.refreshText, textOpacityStyle]}
          animatedProps={refreshTextProps}
        ></Animated.Text>
      </Animated.View>
      <Animated.View style={[refreshHeight, { flex: 1 }]}>
        {/* sticky top */}
        <Animated.View
          style={[
            styles.stickyTop,
            { width: containerSize.width },
            stickyTopMarginStyle,
            animatedOnlyX,
          ]}
          onLayout={layout => {
            cornerHeight.value = layout.nativeEvent.layout.height;
          }}
        >
          {stickyTop}
        </Animated.View>
        {/* corner */}
        <Animated.View
          style={[
            defaultCornerStyle,
            {
              position: 'absolute',
              left: 0,
              backgroundColor: commonColors.gray,
              zIndex: 20,
              ...cornerStyle,
            },
          ]}
        ></Animated.View>
        <Animated.View
          style={{
            flexDirection: 'column',
            flex: 1,
          }}
        >
          {/* stickyLeft */}
          <Animated.View
            onLayout={layout => {
              cornerWidth.value = layout.nativeEvent.layout.width;
            }}
            style={[
              styles.stickyLeft,
              { height: containerSize.height },
              animatedOnlyY,
            ]}
          >
            {stickyLeft}
          </Animated.View>
          <Animated.View
            style={[styles.wrapper, contentMarginStyle]}
            onLayout={event => {
              const { layout } = event.nativeEvent;
              setWrapperSize(layout);
            }}
          >
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[animatedStyle]}>
                {/* 给 children 加上 onLayout 检测，以便滚动距离能正常测量 */}
                {children &&
                  React.cloneElement(children, {
                    onLayout: handleChildLayout,
                  })}
              </Animated.View>
            </GestureDetector>
          </Animated.View>
          {/* sticky bottom */}
          <View style={{ width: '100%', height: 60 }}>
            <Divider>别闹, 学霸也是要睡觉的</Divider>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

ScrollLikeView.displayName = 'ScrollLikeView';

const styles = StyleSheet.create({
  largeWrapper: {
    flex: 1,
    overflow: 'visible', // 确保内容不被裁剪
    flexDirection: 'column',
  },
  wrapper: {
    overflow: 'visible', // 修改为visible以确保内容不被裁剪
    flex: 1,
    zIndex: 2,
  },
  stickyTop: {
    position: 'relative',
    overflow: 'hidden',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  stickyLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexShrink: 0,
    flexGrow: 0,
    zIndex: 9,
  },
  stickyContent: {
    flexShrink: 0,
    flexGrow: 0,
  },
  text: {
    fontSize: 18,
  },
  refreshText: {
    color: commonColors.white,
    fontSize: 14,
    fontWeight: '500',
    marginTop: -24,
  },
  lottieAnimation: {
    width: 180,
    height: 180,
    margin: -40,
    elevation: 20,
    backgroundColor: 'transparent',
  },
});

export default memo(ScrollLikeView);
