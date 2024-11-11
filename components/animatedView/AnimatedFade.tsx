import { memo, useEffect } from 'react';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { FadeAnimationProps } from './types';
/**
 * 线性渐入渐出动画
 * @returns ReactElement
 */
const AnimatedFade = ({
  duration = 350,
  trigger = true,
  distance = 60,
  toVisible = true,
  direction,
  children,
  delay = 0,
  style,
  onAnimationEnd,
  ...restProps
}: FadeAnimationProps) => {
  const posShift = useSharedValue(0);
  const opacity = useSharedValue(toVisible ? 0 : 1);
  useEffect(() => {
    posShift.value = withDelay(
      delay,
      withTiming(trigger ? distance : 0, {
        duration,
        easing: Easing.inOut(Easing.ease),
      })
    );
    if (trigger) {
      opacity.value = withDelay(
        delay,
        withTiming(toVisible ? 1 : 0, {
          duration,
          easing: Easing.inOut(Easing.ease),
        })
      );
    }
  }, [duration, trigger, distance, toVisible, delay]);
  const FadeAnimation = useAnimatedStyle(() => {
    const shiftValue = interpolate(
      posShift.value,
      [0, distance],
      [distance, 0]
    );
    const opacityValue = interpolate(
      opacity.value,
      toVisible ? [0, 1] : [1, 0],
      toVisible ? [0, 1] : [1, 0]
    );
    const computeAnimatedStyle = (direct: FadeAnimationProps['direction']) => {
      if (direct === 'vertical') {
        return {
          translateY: -shiftValue,
        };
      }
      return {
        translateX: -shiftValue,
      };
    };
    return {
      transform: [computeAnimatedStyle(direction)],
      opacity: opacityValue,
    };
  });
  useEffect(() => {
    if (typeof onAnimationEnd === 'function') {
      // 使用 runOnJS 来确保 onAnimationEnd 回调在正确的线程上执行
      runOnJS(onAnimationEnd)();
    }
  }, [opacity.value, onAnimationEnd]);
  return (
    <Animated.View style={[FadeAnimation, style]} {...restProps}>
      {children}
    </Animated.View>
  );
};

export default memo(AnimatedFade);
