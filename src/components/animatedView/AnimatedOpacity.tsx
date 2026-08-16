import { memo, useEffect } from 'react';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
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
  const sharedOpacity = useSharedValue(
    trigger ? (toVisible ? 1 : 0) : toVisible ? 0 : 1
  );
  useEffect(() => {
    if (trigger) {
      sharedOpacity.value = withDelay(
        delay,
        withTiming(
          toVisible ? 1 : 0,
          {
            duration,
          },
          finished => {
            'worklet';
            if (finished && onAnimationEnd) {
              runOnJS(onAnimationEnd)();
            }
          }
        )
      );
    } else {
      sharedOpacity.value = toVisible ? 0 : 1;
    }
  }, [sharedOpacity, duration, trigger, toVisible, delay, onAnimationEnd]);

  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: sharedOpacity.value,
    };
  });

  return (
    <Animated.View style={[opacityStyle, style]} {...restProps}>
      {children}
    </Animated.View>
  );
};

export default memo(AnimatedOpacity);
