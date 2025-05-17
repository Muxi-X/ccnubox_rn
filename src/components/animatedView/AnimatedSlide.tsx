import React, { memo, useEffect } from 'react';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { SlideInProps } from '@/components/animatedView/types';

const AnimatedSlideIn: React.FC<SlideInProps> = ({
  duration = 500,
  delay = 0,
  style,
  trigger = true,
  children,
  distance = 100,
  onAnimationEnd,
  direction = 'vertical',
  ...restProps
}) => {
  const translateY = useSharedValue(
    direction === 'vertical' ? distance : -distance
  ); // 初始值设置为屏幕外的位置

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(trigger ? 0 : distance, {
        duration,
        easing: Easing.inOut(Easing.ease),
      })
    );
  }, [duration, delay, trigger]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    };
  });
  useEffect(() => {
    if (typeof onAnimationEnd === 'function') {
      runOnJS(onAnimationEnd)();
    }
  }, [translateY, onAnimationEnd]);
  return (
    <Animated.View style={[style, animatedStyle]} {...restProps}>
      {children}
    </Animated.View>
  );
};

export default memo(AnimatedSlideIn);
