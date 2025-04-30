import { memo, useEffect } from 'react';
import Animated, {
  runOnJS,
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
  duration = 150,
  trigger = true,
  children,
  style,
  delay = 0,
  toVisible = true,
  onAnimationEnd,
  ...restProps
}: OpacityAnimationProps) => {
  const sharedOpacity = useSharedValue(toVisible ? 0 : 1);
  useEffect(() => {
    if (trigger) {
      sharedOpacity.value = withDelay(
        delay,
        withSpring(toVisible ? 1 : 0, {
          mass: 0.5,
          stiffness: 100,
          damping: 10,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        })
      );
    }
  }, [sharedOpacity, duration, trigger, toVisible, delay]);
  const opacityStyle = useAnimatedStyle(() => {
    const opacity = sharedOpacity.value;
    if (
      ((opacity === 1 && toVisible) || (!opacity && !toVisible)) &&
      typeof onAnimationEnd === 'function'
    )
      runOnJS(onAnimationEnd)();

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

export default memo(AnimatedOpacity);
