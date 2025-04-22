import React, { memo, useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ScrollableViewProps } from '@/components/scrollView/type';

import { commonColors } from '@/styles/common';
import globalEventBus from '@/utils/eventBus';

import Toast from '../toast';

const REFRESH_THRESHOLD = 100; // 触发刷新的阈值

// 刷新状态类型定义
// 'pull': 下拉状态
// 'release': 可释放刷新状态
// 'refreshing': 正在刷新状态
type RefreshState = 'pull' | 'release' | 'refreshing';

const ScrollLikeView = React.forwardRef<View, ScrollableViewProps>(
  (props, ref) => {
    const {
      onScrollToBottom,
      stickyTop,
      stickyLeft,
      children,
      style,
      cornerStyle,
      onRefresh,
      collapsable,
      enableScrolling = true, // 默认启用滚动
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
    const isAtBottom = useSharedValue(false);
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

    useEffect(() => {
      isAtTop.value && onReachTopEnd();
      isAtBottom.value && onReachBottomEnd();
    }, [isAtTop.value, isAtBottom.value]);

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

    // 监听边界事件
    const onReachTopEnd = () => {
      if (!onRefresh) return;

      onRefresh(
        () => {
          // 请求成功后立即显示提示，提高响应速度
          Toast.show({
            text: '刷新成功',
            icon: 'success',
          });
          backHeight.value = withTiming(0, {
            duration: 500,
          });
          // 使用 setTimeout 来延迟动画开始时间
          setTimeout(() => {
            // 在动画完成后重置状态
            refreshTextState.value = 'pull';
            isRefreshing.value = false;
          }, 2000); // 减少延迟时间
        },
        () => {
          // 请求失败后立即显示提示，提高响应速度
          Toast.show({
            text: '刷新失败',
            icon: 'fail',
          });

          backHeight.value = withTiming(0, {
            duration: 500,
          });
          // 使用 setTimeout 来延迟动画开始时间
          setTimeout(() => {
            // 在动画完成后重置状态
            refreshTextState.value = 'pull';
            isRefreshing.value = false;
          }, 2000); // 减少延迟时间
        }
      );
    };

    const onReachBottomEnd = () => {
      onScrollToBottom && onScrollToBottom();
    };

    // 定义最小下拉触发阈值
    const MIN_PULL_THRESHOLD = 30;

    // 处理下拉刷新逻辑 - 优化性能
    const handlePullToRefresh = (event: any) => {
      'worklet';
      // 在刷新状态下不处理下拉刷新，避免高度闪烁
      if (isRefreshing.value) {
        return;
      }

      // 缓存当前值，减少重复访问
      const currentTranslateY = translateY.value;
      const shouldAllowRefresh = shouldRefresh.value;
      const isAlreadyTriggered = isTriggered.value;

      // 检查是否是向上滑动或者不在顶部
      // 这是修复刷新提示框在向上滑动时高度不会还原的关键
      if (event.translationY <= 0 || currentTranslateY !== 0) {
        // 如果是向上滑动且刷新提示框高度大于0，则立即重置高度
        if (backHeight.value > 0 && !isRefreshing.value) {
          backHeight.value = 0;
          // 同时重置文本状态
          if (refreshTextState.value !== 'pull') {
            refreshTextState.value = 'pull';
          }
        }
        return; // 提前返回，不执行后续逻辑
      }

      // 只有在顶部且向下拉动时才处理刷新
      if (shouldAllowRefresh) {
        if (!isAlreadyTriggered) {
          // 添加阻尼效果，使用更小的系数来减少移动敏感度
          const dampedTranslation = event.translationY * 0.7;

          // 使用阈值来减少更新频率
          // 只有当下拉距离超过最小阈值时才显示刷新指示器
          if (dampedTranslation >= MIN_PULL_THRESHOLD) {
            // 使用离散值来减少更新频率
            const newHeight = Math.min(
              Math.floor((dampedTranslation - MIN_PULL_THRESHOLD) / 2) * 2,
              REFRESH_THRESHOLD
            );

            // 只有当高度变化超过 2px 时才更新，减少小幅度频繁更新
            if (Math.abs(newHeight - backHeight.value) >= 0.2) {
              backHeight.value = newHeight;
            }

            // 当拉动超过阈值时，更新状态
            if (
              dampedTranslation > REFRESH_THRESHOLD &&
              refreshTextState.value !== 'release'
            ) {
              refreshTextState.value = 'release';
              // 当进入松手刷新状态时，将高度固定为 REFRESH_THRESHOLD
            } else if (
              dampedTranslation <= REFRESH_THRESHOLD &&
              refreshTextState.value === 'release'
            ) {
              // 如果回到阈值以下，重置状态
              refreshTextState.value = 'pull';
            }
          } else if (backHeight.value > 0) {
            // 如果下拉距离小于最小阈值，不显示刷新指示器
            backHeight.value = 0;
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

      // 缓存当前值，减少重复访问
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

      // 使用更小的阻尼系数，减少敏感度
      const dampedTranslation = event.translationY * 0.7;

      if (
        dampedTranslation > REFRESH_THRESHOLD &&
        dampedTranslation >= MIN_PULL_THRESHOLD
      ) {
        // 触发刷新，保持指示器在阈值位置
        // 先设置状态，再设置高度，避免安卓上的闪烁
        refreshTextState.value = 'refreshing';
        // 设置正在刷新状态，禁用滚动
        isRefreshing.value = true;
        isTriggered.value = true;

        // 直接设置固定高度，不使用动画，避免高度变化
        // 确保与松手刷新状态的高度一致
        backHeight.value = REFRESH_THRESHOLD;

        // 使用 runOnJS 在 JS 线程上调用回调，避免阻塞 UI 线程
        runOnJS(onReachTopEnd)();
      } else if (backHeight.value > 0) {
        // 只有当高度大于 0 时才需要重置，避免不必要的更新
        // 重置状态
        refreshTextState.value = 'pull';
        // 使用更短的动画时间，减少延迟感
        backHeight.value = withTiming(0, {
          duration: 100,
        });
        // 确保刷新状态被重置，即使用户取消了刷新
        isRefreshing.value = false;
      }
      isTriggered.value = false;
    };

    // 创建动态手势处理器，在刷新状态下禁用滚动 - 优化性能
    const panGesture = Gesture.Pan()
      .onStart(() => {
        'worklet';
        // 在刷新状态下不允许开始新的滑动
        if (isRefreshing.value) {
          return;
        }
        // 缓存当前值，减少重复访问
        startX.value = translateX.value;
        startY.value = translateY.value;
      })
      .onUpdate(event => {
        'worklet';
        // 缓存当前值，减少重复访问
        const isCurrentlyRefreshing = isRefreshing.value;

        // 在刷新状态下不处理滑动更新
        if (isCurrentlyRefreshing) {
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

        // 检测横向滑动是否过大，使用更大的阈值减少误触发
        if (Math.abs(event.absoluteX - prevTranslateX.value) > 80) {
          shouldRefresh.value = false;
        }

        // 处理下拉刷新
        handlePullToRefresh(event);

        // 只有启用滚动时才处理滚动
        if (enableScrolling) {
          // 缓存当前值，减少重复计算
          const currentStartX = startX.value;
          const currentStartY = startY.value;
          const currentWrapperWidth = wrapperSize.width;
          const currentContainerWidth = containerSize.width;
          const currentWrapperHeight = wrapperSize.height;
          const currentContainerHeight = containerSize.height;

          // 使用离散值来减少更新频率
          // 将位移四舍五入到最接近的 2px 值
          const newTranslateX =
            Math.floor(
              Math.min(
                0,
                Math.max(
                  currentStartX + event.translationX,
                  currentWrapperWidth - currentContainerWidth
                )
              ) / 2
            ) * 2;

          const newTranslateY =
            Math.floor(
              Math.min(
                0,
                Math.max(
                  currentStartY + event.translationY,
                  currentWrapperHeight - currentContainerHeight
                )
              ) / 2
            ) * 2;

          // 只有当位移变化超过 2px 时才更新，减少小幅度频繁更新
          if (Math.abs(newTranslateX - translateX.value) >= 2) {
            translateX.value = newTranslateX;
          }

          if (Math.abs(newTranslateY - translateY.value) >= 2) {
            translateY.value = newTranslateY;
          }
        }
      })
      .onEnd(event => {
        'worklet';
        // 在刷新状态下不处理滑动结束
        if (isRefreshing.value) {
          return;
        }
        handleRefreshComplete(event);
      });

    // Create animated styles for various components

    // Animated style for corner top position
    const cornerTopStyle = useAnimatedStyle(() => {
      return {
        top: backHeight.value,
      };
    }, []);
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
    const handleChildLayout = (event: LayoutChangeEvent) => {
      const { layout } = event.nativeEvent;
      setContainerSize(layout);
    };

    // 使用状态文本映射，避免频繁计算和更新
    const refreshTextMap = {
      pull: '下拉刷新课表',
      pullMore: '继续下拉刷新课表',
      release: '松开即可刷新',
      refreshing: '刷新中...',
    };

    // 创建文本状态的动画样式 - 优化性能
    const textOpacityStyle = useAnimatedStyle(() => {
      // 缓存当前值，减少重复访问
      const currentRefreshState = refreshTextState.value;
      const currentHeight = backHeight.value;

      // 当处于刷新状态时，始终保持完全不透明
      if (currentRefreshState === 'refreshing') {
        return { opacity: 1 };
      }

      // 使用离散的不透明度值，减少频繁更新
      // 只使用三个不透明度级别，避免微小变化
      const ratio = currentHeight / (REFRESH_THRESHOLD * 0.7);
      let opacity;

      if (ratio < 0.2) {
        opacity = 0.4; // 最小不透明度
      } else if (ratio < 0.6) {
        opacity = 0.7; // 中等不透明度
      } else {
        opacity = 1; // 完全不透明
      }

      return { opacity };
    }, []);

    // 创建指针事件样式，在刷新状态下禁用交互 - 优化性能
    const pointerEventsStyle = useAnimatedStyle(() => {
      // 缓存当前值，减少重复访问
      const isCurrentlyRefreshing = isRefreshing.value;

      return {
        // 当处于刷新状态时，禁用所有交互
        pointerEvents: isCurrentlyRefreshing ? 'none' : ('auto' as any),
      };
    }, []);

    return (
      <View
        style={[styles.largeWrapper, style]}
        ref={ref}
        collapsable={collapsable}
        // 确保内容不被裁剪
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            {
              width: '100%',
              zIndex: 21,
              height: backHeight,
              // 使用 translateY 来强制硬件加速
              transform: [{ translateY: 0 }],
              opacity: 1,
              backgroundColor: commonColors.purple,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Animated.Text style={[styles.refreshText, textOpacityStyle]}>
            {refreshTextState.value === 'refreshing'
              ? refreshTextMap.refreshing
              : refreshTextState.value === 'release'
                ? refreshTextMap.release
                : backHeight.value > REFRESH_THRESHOLD * 0.5
                  ? refreshTextMap.pullMore
                  : refreshTextMap.pull}
          </Animated.Text>
        </Animated.View>
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
            cornerStyle,
            defaultCornerStyle,
            cornerTopStyle,
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
            flexDirection: 'row',
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
              <Animated.View style={[animatedStyle, pointerEventsStyle]}>
                {/* 给 children 加上 onLayout 检测，以便滚动距离能正常测量 */}
                {children &&
                  React.cloneElement(children, { onLayout: handleChildLayout })}
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </Animated.View>
        {/* sticky bottom */}
      </View>
    );
  }
);

ScrollLikeView.displayName = 'ScrollLikeView';

const styles = StyleSheet.create({
  largeWrapper: {
    flex: 1,
    overflow: 'visible', // 确保内容不被裁剪
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
  },
});

export default memo(ScrollLikeView);
