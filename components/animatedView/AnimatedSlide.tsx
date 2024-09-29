import React, { memo, useEffect } from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { SlideInProps } from '@/components/animatedView/types';

const AnimatedSlideIn: React.FC<SlideInProps> = ({
  duration = 500,
  delay = 0,
  style,
  trigger = true,
  children,
  distance = 100,
  direction = 'vertical',
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

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
};

export default memo(AnimatedSlideIn);
