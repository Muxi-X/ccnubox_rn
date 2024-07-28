import { useEffect } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { BaseAnimatedProps } from './types';
/**
 * 透明度动画
 * @returns ReactElement
 */
const AnimatedOpacity = ({
  duration = 350,
  trigger = true,
  children,
  style,
  ...restProps
}: BaseAnimatedProps) => {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(trigger ? 1 : 0, { duration: duration });
  }, [scale, duration, trigger]);
  const opacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

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
