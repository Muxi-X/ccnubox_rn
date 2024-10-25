import React, { FC, useEffect, useState } from 'react';
import { View, StyleSheet, LayoutRectangle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import { ScrollableViewProps } from '@/components/scrollView/type';
import { commonColors } from '@/styles/common';

const ScrollLikeView: FC<ScrollableViewProps> = props => {
  const { onScrollToTop, onScrollToBottom, stickyTop, stickyLeft, children } =
    props;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const cornerWidth = useSharedValue(0);
  const cornerHeight = useSharedValue(0);

  const [isAtTop, setIsAtTop] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    height: 0,
    width: 0,
  });
  const [wrapperSize, setWrapperSize] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  useEffect(() => {
    isAtTop && onReachTopEnd();
    isAtBottom && onReachBottomEnd();
  }, [isAtTop, isAtBottom]);

  // 监听边界事件
  const onReachTopEnd = () => {
    console.log('Reached Top End');
    onScrollToTop && onScrollToTop();
    setIsAtTop(false);
  };

  const onReachBottomEnd = () => {
    console.log('Reached Bottom End');
    onScrollToBottom && onScrollToBottom();
    setIsAtBottom(false);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // 在手势开始时记录当前的偏移量
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate(event => {
      translateX.value = Math.min(startX.value + event.translationX, 0);
      translateY.value = Math.min(startY.value + event.translationY, 0);
    })
    .onEnd(() => {
      // 检查是否触及顶部或底部边界，触发状态
      if (Math.abs(translateX.value - startX.value) < 30) {
        if (translateY.value >= 0) {
          !isAtTop && runOnJS(setIsAtTop)(true);
        } else if (
          translateY.value <= -(containerSize.height - wrapperSize.height)
        ) {
          !isAtBottom && runOnJS(setIsAtBottom)(true);
        }
      }
      // 超出边界就弹回
      translateX.value = withSpring(
        Math.max(translateX.value, containerSize.width - wrapperSize.width)
      );
      console.log(translateY.value, containerSize.height, wrapperSize.height);
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

  return (
    <View style={styles.largeWrapper}>
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
      <Animated.View
        style={{
          height: cornerHeight,
          width: cornerWidth,
          position: 'absolute',
          top: 0,
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
            <Animated.View
              style={[{ width: containerSize.width }, animatedStyle]}
              onLayout={event => {
                const { layout } = event.nativeEvent;
                setContainerSize(layout);
              }}
            >
              {children}
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
