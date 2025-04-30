import { memo, useEffect } from 'react';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { ScaleAnimationProps } from './types';
/**
 * 线性大小动画
 * @returns ReactElement
 */
const AnimatedScale = ({
  // Reduce animation range and duration for snappier tab switches
  outputRange = [0.95, 1.05],
  duration = 200,
  trigger = true,
  delay = 0,
  children,
  style,
  onAnimationEnd,
  ...restProps
}: ScaleAnimationProps) => {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(trigger ? 1 : 0, {
        mass: 0.5,
        stiffness: 120,
        damping: 12,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      })
    );
  }, [scale, duration, trigger, delay]);
  const ScaleAnimation = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], outputRange);
    const top = interpolate(scale.value, [0, 1], [0, 4]);
    return {
      transform: [
        {
          scale: scaleValue,
        },
      ],
      top,
    };
  });
  useEffect(() => {
    if (scale.value === 1 && typeof onAnimationEnd === 'function') {
      runOnJS(onAnimationEnd)();
    }
  }, [scale.value, onAnimationEnd]);
  return (
    <Animated.View style={[ScaleAnimation, style]} {...restProps}>
      {children}
    </Animated.View>
  );
};

export default memo(AnimatedScale);
