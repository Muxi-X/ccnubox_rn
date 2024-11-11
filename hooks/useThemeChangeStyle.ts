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
  const currentStyle = useVisualScheme(state => state.currentStyle); // 获取当前颜色值
  const previousColor = useSharedValue(
    (currentStyle?.[configurableThemeName]?.[styleName] ?? '') as string
  );
  // 共享值来控制动画进度
  const progress = useSharedValue(0);

  // 动态样式
  const animatedStyle = useAnimatedStyle(() => {
    const color = isFocused
      ? interpolateColor(
          progress.value,
          [0, 1],
          [
            previousColor.value,
            (currentStyle?.[configurableThemeName]?.[styleName] ??
              '') as string,
          ] // 输出的颜色范围
        )
      : previousColor.value;

    return {
      [styleName]: color,
    };
  });

  useEffect(() => {
    const currentColor =
      currentStyle?.[configurableThemeName]?.[styleName] ?? '';
    if (isFocused && previousColor.value !== currentColor) {
      // 颜色更新时，从当前颜色到新颜色进行动画
      progress.value = 0; // 重置进度
      progress.value = withTiming(1, { duration: 400 }, () => {
        previousColor.value = currentColor as string;
      });
    }
  }, [currentStyle, isFocused]);

  return animatedStyle;
};

export default useThemeChangeStyle;
