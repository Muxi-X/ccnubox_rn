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
  withDecay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ScrollableViewProps } from '@/components/scrollView/type';

import { commonColors } from '@/styles/common';

const ScrollLikeView: FC<ScrollableViewProps> = props => {
  const {
    onScrollToBottom,
    stickyTop,
    stickyLeft,
    children,
    style,
    onRefresh,
  } = props;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  // FIX_ME 此处为两个 sticky 交界处，会覆盖，很丑，目前方式为计算重叠块大小，用一个块覆盖
  const cornerWidth = useSharedValue(0);
  const cornerHeight = useSharedValue(0);
  // 下拉刷新背景高度
  const backHeight = useSharedValue(0);
  const overScrollHeight = useSharedValue(0);
  const isAtTop = useSharedValue(false);
  const isAtBottom = useSharedValue(false);
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
  // 下拉刷新文本状态
  const [refreshText, setRefreshText] = useState('下拉刷新课表');
  // 添加一个标记来判断是否已经在顶部
  const hasReachedTop = useSharedValue(false);

  useEffect(() => {
    isAtTop.value && onReachTopEnd();
    isAtBottom.value && onReachBottomEnd();
  }, [isAtTop.value, isAtBottom.value]);

  // 监听边界事件
  const onReachTopEnd = () => {
    if (!onRefresh) return;

    const handleHideRefreshing = () => {
      backHeight.value = withTiming(0);
      isAtTop.value = false; // 重置状态
      runOnJS(setRefreshText)('下拉刷新课表');
    };

    const success = () => {
      handleHideRefreshing();
    };

    const fail = () => {
      handleHideRefreshing();
      Toast.fail('刷新失败');
    };

    onRefresh(success, fail);
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
      // 只有已经在顶部的情况下才允许下拉刷新
      if (translateY.value === 0 && event.translationY > 0) {
        if (hasReachedTop.value) {
          if (event.translationY > 60) {
            backHeight.value = withSpring(100, {
              damping: 15,
              stiffness: 150,
            });
            runOnJS(setRefreshText)('松开即刷新');
          } else {
            backHeight.value = event.translationY;
            runOnJS(setRefreshText)('下拉刷新课表');
          }
        } else {
          // 第一次到达顶部，设置标记
          hasReachedTop.value = true;
        }
      }

      // 当不在顶部时重置标记
      if (translateY.value !== 0) {
        hasReachedTop.value = false;
      }

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
      if (isAtBottom.value) {
        overScrollHeight.value = withSpring(
          event.translationY < 0 ? Math.min(-event.translationY, 100) : 0,
          {
            damping: 20,
            stiffness: 200,
          }
        );
      }
    })
    .onEnd(event => {
      // 只有已经在顶部的情况下才触发刷新
      if (
        translateY.value === 0 &&
        backHeight.value > 100 &&
        hasReachedTop.value
      ) {
        isAtTop.value = true;
      } else {
        backHeight.value = withTiming(0);
        isAtTop.value = false;
      }

      if (Math.abs(event.velocityY) > 0) {
        translateY.value = withDecay({
          velocity: event.velocityY,
          clamp: [wrapperSize.height - containerSize.height, 0],
          deceleration: 0.292,
          velocityFactor: 0.9,
        });
      }

      if (Math.abs(event.velocityX) > 0) {
        translateX.value = withDecay({
          velocity: event.velocityX,
          clamp: [wrapperSize.width - containerSize.width, 0],
          deceleration: 0.992,
          velocityFactor: 0.8,
        });
      }

      if (isAtBottom.value && event.translationY < 0) {
        translateY.value = withSpring(
          wrapperSize.height - containerSize.height,
          {
            damping: 15,
            stiffness: 150,
          }
        );
        overScrollHeight.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
        isAtBottom.value = false;
      } else if (
        translateY.value <= -(containerSize.height - wrapperSize.height) &&
        !isAtBottom.value
      ) {
        isAtBottom.value = true;
      }

      if (!isAtTop.value) {
        runOnJS(setRefreshText)('下拉刷新课表');
      }
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

  return (
    <View style={[styles.largeWrapper, style]}>
      {/* refresh control */}
      <Animated.View
        style={{
          height: backHeight,
          width: '100%',
          // 解决下拉刷新时用户滚动页面溢出问题
          zIndex: 21,
          backgroundColor: commonColors.purple,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: commonColors.white,
          }}
        >
          {refreshText}
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
      {/* <Animated.View
        style={{
          width: '100%',
          height: overScrollHeight,
          zIndex: -20,
          overflow: 'hidden',
        }}
      >
        {stickyBottom}
      </Animated.View> */}
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
});

export default memo(ScrollLikeView);
