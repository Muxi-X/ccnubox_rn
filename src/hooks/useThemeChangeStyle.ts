import { useIsFocused } from '@react-navigation/core';
import { useEffect } from 'react';
import {
  interpolateColor,
  StyleProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import useVisualScheme from '@/store/visualScheme';

import { ConfigurableThemeNames } from '@/styles/types';

const useThemeChangeStyle = (
  configurableThemeName: ConfigurableThemeNames,
  styleName: keyof StyleProps
) => {
  const isFocused = useIsFocused();
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const previousColor = useSharedValue(
    (currentStyle?.[configurableThemeName]?.[styleName] ?? '') as string
  );
  const progress = useSharedValue(0);

  // 动态样式
  const animatedStyle = useAnimatedStyle(() => {
    const currentColor = (currentStyle?.[configurableThemeName]?.[styleName] ??
      '') as string;

    // 如果不是当前页面，直接返回新的颜色值
    if (!isFocused) {
      return {
        [styleName]: currentColor,
      };
    }

    // 当前页面才执行动画
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [previousColor.value, currentColor]
    );

    return {
      [styleName]: color,
    };
  });

  useEffect(() => {
    'worklet';
    const currentColor =
      currentStyle?.[configurableThemeName]?.[styleName] ?? '';
    if (previousColor.value !== currentColor) {
      if (isFocused) {
        progress.value = withTiming(1, { duration: 400 }, () => {
          previousColor.value = currentColor as string;
        });
      } else {
        // 非当前页面直接更新颜色，不执行动画
        progress.value = 1;
        previousColor.value = currentColor as string;
      }
    }
  }, [currentStyle, isFocused]);

  return animatedStyle;
};

export default useThemeChangeStyle;
