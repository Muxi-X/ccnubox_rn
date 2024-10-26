import React, { FC, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  LayoutRectangle,
  LayoutChangeEvent,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Divider from '@/components/divider';
import { ScrollableViewProps } from '@/components/scrollView/type';
import { commonColors } from '@/styles/common';

const ScrollLikeView: FC<ScrollableViewProps> = props => {
  const { onScrollToTop, onScrollToBottom, stickyTop, stickyLeft, children } =
    props;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  // FIX_ME 此处为两个 sticky 交界处，会覆盖，很丑，目前方式为计算重叠块大小，用一个块覆盖
  const cornerWidth = useSharedValue(0);
  const cornerHeight = useSharedValue(0);
  // 下拉刷新背景高度
  const backHeight = useSharedValue(0);
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
  useEffect(() => {
    isAtTop.value && onReachTopEnd();
    isAtBottom && onReachBottomEnd();
  }, [isAtTop.value, isAtBottom]);

  // 监听边界事件
  const onReachTopEnd = () => {
    console.log('Reached Top End');
    setTimeout(() => {
      backHeight.value = withTiming(0);
      isAtTop.value = false;
    }, 2000);
    onScrollToTop && onScrollToTop();
  };

  const onReachBottomEnd = () => {
    console.log('Reached Bottom End');
    onScrollToBottom && onScrollToBottom();
    isAtBottom.value = false;
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // 在手势开始时记录当前的偏移量
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate(event => {
      if (isAtTop.value && event.translationY > 100) {
        backHeight.value = withSpring(100);
      }
      // 根据加速度切换动画效果，如果全用 withTiming
      // 低速下会造成卡顿的错觉
      translateX.value = Math.min(startX.value + event.translationX, 0);
      translateY.value = Math.min(startY.value + event.translationY, 0);
    })
    .onEnd(() => {
      // 检查是否触及顶部或底部边界，触发状态
      if (Math.abs(translateX.value - startX.value) < 30) {
        if (translateY.value >= 0) {
          if (!isAtTop.value) isAtTop.value = true;
        } else if (
          translateY.value <= -(containerSize.height - wrapperSize.height)
        ) {
          if (!isAtBottom.value) isAtBottom.value = true;
        }
      }
      // 超出边界就弹回
      translateX.value = withSpring(
        Math.max(translateX.value, -(containerSize.width - wrapperSize.width))
      );
      console.log(translateX.value, containerSize.width, wrapperSize.width);
      translateY.value = withSpring(
        Math.max(
          translateY.value,
          -(containerSize?.height - wrapperSize?.height)
        )
      );
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });
  const animatedOnlyX = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const animatedOnlyY = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const handleChildLayout = (event: LayoutChangeEvent) => {
    const { layout } = event.nativeEvent;
    console.log(layout);
    setContainerSize(layout);
  };

  return (
    <View style={styles.largeWrapper}>
      {/* refresh control */}
      <Animated.View
        style={{
          height: backHeight,
          width: '100%',
          zIndex: 50,
          backgroundColor: '#000',
        }}
      ></Animated.View>
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
      <View style={{ flexDirection: 'row', flex: 1 }}>
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
              {/*{children}*/}
              {children &&
                React.cloneElement(children, { onLayout: handleChildLayout })}
              <Divider
                style={{
                  flexShrink: 0,
                  width: wrapperSize.width,
                }}
                color={commonColors.gray}
              >
                别闹，学霸也是要睡觉的
              </Divider>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
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
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});

export default ScrollLikeView;
