import React, { memo, useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  Text,
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
    const refreshTextState = useSharedValue('pull'); // 'pull' | 'release' | 'refreshing'
    const isTriggered = useSharedValue(false); // 是否已触发刷新

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
          // 请求成功后等待1秒再重置
          setTimeout(() => {
            backHeight.value = withTiming(0, {
              duration: 300,
            });
            refreshTextState.value = 'pull';
            Toast.show({
              text: '刷新成功',
              icon: 'success',
            });
          }, 1000);
        },
        () => {
          // 请求失败后等待1秒再重置
          setTimeout(() => {
            backHeight.value = withTiming(0, {
              duration: 300,
            });
            refreshTextState.value = 'pull';
            runOnJS(Toast.fail)('刷新失败');
          }, 1000);
        }
      );
    };

    const onReachBottomEnd = () => {
      onScrollToBottom && onScrollToBottom();
    };

    const panGesture = Gesture.Pan()
      .onStart(() => {
        startX.value = translateX.value;
        startY.value = translateY.value;
      })
      .onUpdate(event => {
        'worklet';
        if (Math.abs(event.absoluteX - prevTranslateX.value) > 60) {
          shouldRefresh.value = false;
        }
        if (
          translateY.value === 0 &&
          event.translationY > 0 &&
          shouldRefresh.value
        ) {
          if (!isTriggered.value) {
            backHeight.value = Math.min(event.translationY, REFRESH_THRESHOLD);
            if (event.translationY > REFRESH_THRESHOLD) {
              isTriggered.value = true;
              refreshTextState.value = 'release';
            }
          }
        }

        if (translateY.value !== 0) {
          backHeight.value = 0;
        }

        // 只有启用滚动时才处理滚动
        if (enableScrolling) {
          // 正常滚动处理
          translateX.value = Math.min(
            0,
            Math.max(
              startX.value + event.translationX,
              wrapperSize.width - containerSize.width
            )
          );
          translateY.value = Math.min(
            0,
            Math.max(
              startY.value + event.translationY,
              wrapperSize.height - containerSize.height
            )
          );
        }
      })
      .onEnd(event => {
        prevTranslateX.value = event.absoluteX;
        shouldRefresh.value = true;
        if (isTriggered.value) {
          // 触发时保持在阈值位置，等待请求完成
          refreshTextState.value = 'refreshing';
          backHeight.value = withTiming(REFRESH_THRESHOLD);
          runOnJS(onReachTopEnd)();
        } else {
          // 如果没触发刷新，直接重置
          backHeight.value = withTiming(0);
        }
        isTriggered.value = false;
      });

    // Create animated styles for various components

    // Animated style for refresh header height
    const refreshHeaderStyle = useAnimatedStyle(() => {
      return {
        height: backHeight.value,
      };
    }, []);

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

    // 使用普通的 Text 组件而不是 Animated.Text
    const RefreshText = () => {
      switch (refreshTextState.value) {
        case 'release':
          return '松开即可刷新';
        case 'refreshing':
          return '刷新中...';
        default:
          return '下拉刷新课表';
      }
    };

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
            refreshHeaderStyle,
            {
              width: '100%',
              zIndex: 21,
              backgroundColor: commonColors.purple,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Text style={{ color: commonColors.white }}>
            <RefreshText />
          </Text>
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
              <Animated.View style={[animatedStyle]}>
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
  },
});

export default memo(ScrollLikeView);
