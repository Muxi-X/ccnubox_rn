import { memo, useEffect } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { FadeAnimationProps } from './types';
/**
 * 线性大小动画
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
  return (
    <Animated.View style={[FadeAnimation, style]} {...restProps}>
      {children}
    </Animated.View>
  );
};

export default memo(AnimatedFade);
