import { Toast } from '@ant-design/react-native';
import React, { FC, memo, useEffect, useState } from 'react';
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

import Modal from '../modal';

const REFRESH_THRESHOLD = 100; // 触发刷新的阈值

const ScrollLikeView: FC<ScrollableViewProps> = props => {
  const {
    onScrollToBottom,
    stickyTop,
    stickyLeft,
    children,
    style,
    conrerStyle,
    onRefresh,
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
          Modal.show({
            title: '刷新成功',
            mode: 'middle',
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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  }, []);
  const animatedOnlyX = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const animatedOnlyY = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
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
    <View style={[styles.largeWrapper, style]}>
      <Animated.View
        style={{
          height: backHeight,
          width: '100%',
          zIndex: 21,
          backgroundColor: commonColors.purple,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: commonColors.white }}>
          <RefreshText />
        </Text>
      </Animated.View>
      {/* sticky top */}
      <Animated.View
        style={[
          styles.stickyContent,
          { width: containerSize.width, marginLeft: cornerWidth },
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
        style={{
          height: cornerHeight,
          width: cornerWidth,
          position: 'absolute',
          top: backHeight,
          left: 0,
          backgroundColor: commonColors.gray,
          zIndex: 20,
          ...conrerStyle,
        }}
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
        <View
          style={[styles.wrapper]}
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
        </View>
      </Animated.View>
      {/* sticky bottom */}
    </View>
  );
};

const styles = StyleSheet.create({
  largeWrapper: {
    flex: 1,
  },
  wrapper: {
    overflow: 'hidden',
    flex: 1,
    zIndex: 2,
  },
  stickyTop: {
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    left: 0,
    zIndex: 5,
  },
  stickyLeft: {
    position: 'relative',
    top: 0,
    left: 0,
    flexShrink: 0,
    flexGrow: 0,
  },
  stickyContent: {
    flexShrink: 0,
    flexGrow: 0,
  },
  box: {
    height: 200,
    backgroundColor: '#000',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  text: {
    fontSize: 18,
  },
  refreshText: {
    color: commonColors.white,
  },
});

export default memo(ScrollLikeView);
