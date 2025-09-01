import { memo, useEffect } from 'react';
import Animated, {
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
  outputRange = [0.9, 1.1],
  duration = 200,
  trigger = true,
  delay = 0,
  children,
  style,
  onAnimationEnd,
  ...restProps
}: ScaleAnimationProps) => {
  const scale = useSharedValue(outputRange[0]);
  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(trigger ? outputRange[1] : outputRange[0], {
        mass: 0.5,
        stiffness: 120,
        damping: 12,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      })
    );
  }, [scale, duration, trigger, delay]);
  const ScaleAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });
  useEffect(() => {
    if (
      scale.value === outputRange[1] &&
      typeof onAnimationEnd === 'function'
    ) {
      runOnJS(onAnimationEnd)();
    }
  }, [scale, onAnimationEnd]);
  return (
    <Animated.View style={[ScaleAnimation, style]} {...restProps}>
      {children}
    </Animated.View>
  );
};

export default memo(AnimatedScale);
