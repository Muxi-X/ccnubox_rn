import { memo, useEffect } from 'react';
import Animated, {
  interpolate,
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
  outputRange = [0.8, 1.2],
  duration = 350,
  trigger = true,
  delay = 0,
  children,
  style,
  ...restProps
}: ScaleAnimationProps) => {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(delay, withSpring(trigger ? 1 : 0, { duration }));
  }, [scale, duration, trigger, delay]);
  const ScaleAnimation = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], outputRange);
    const top = interpolate(scale.value, [0, 1], [0, 8]);
    return {
      transform: [
        {
          scale: scaleValue,
        },
      ],
      top,
    };
  });
  return (
    <Animated.View style={[ScaleAnimation, style]} {...restProps}>
      {children}
    </Animated.View>
  );
};

export default memo(AnimatedScale);
