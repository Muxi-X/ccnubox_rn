import { useEffect } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { OpacityAnimationProps } from './types';
/**
 * 透明度动画
 * @returns ReactElement
 */
const AnimatedOpacity = ({
  duration = 350,
  trigger = true,
  children,
  style,
  delay = 0,
  toVisible = true,
  ...restProps
}: OpacityAnimationProps) => {
  const sharedOpacity = useSharedValue(toVisible ? 0 : 1);
  useEffect(() => {
    if (trigger) {
      sharedOpacity.value = withDelay(
        delay,
        withSpring(toVisible ? 1 : 0, {
          duration,
        })
      );
    }
  }, [sharedOpacity, duration, trigger, toVisible, delay]);
  const opacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      sharedOpacity.value,
      toVisible ? [0, 1] : [1, 0],
      toVisible ? [0, 1] : [1, 0]
    );

    return {
      // styles
      opacity,
    };
  });
  return (
    <Animated.View style={[opacityStyle, style]} {...restProps}>
      {children}
    </Animated.View>
  );
};

export default AnimatedOpacity;
