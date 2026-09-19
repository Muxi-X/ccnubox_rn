import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import useVisualScheme from '@/store/visualScheme';
import { ConfigurableThemeNames } from '@/styles/types';

type ColorStyleName = 'backgroundColor' | 'color';
type ThemeColorStyle = Partial<Record<ColorStyleName, string>>;

const useThemeChangeStyle = (
  configurableThemeName: ConfigurableThemeNames,
  styleName: ColorStyleName
) => {
  const isFocused = useIsFocused();
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const previousColor = useSharedValue(
    (currentStyle?.[configurableThemeName] as ThemeColorStyle | undefined)?.[
      styleName
    ] ?? ''
  );
  const progress = useSharedValue(0);

  // 动态样式
  const animatedStyle = useAnimatedStyle(() => {
    const currentColor =
      (currentStyle?.[configurableThemeName] as ThemeColorStyle | undefined)?.[
        styleName
      ] ?? '';

    // 如果不是当前页面，直接返回新的颜色值
    if (!isFocused) {
      return {
        [styleName]: currentColor,
      };
    }

    return {
      [styleName]: interpolateColor(
        progress.value,
        [0, 1],
        [previousColor.value, currentColor]
      ),
    };
  });

  useEffect(() => {
    'worklet';
    const currentColor =
      (currentStyle?.[configurableThemeName] as ThemeColorStyle | undefined)?.[
        styleName
      ] ?? '';
    if (previousColor.value !== currentColor) {
      progress.value = withTiming(1, { duration: 400 }, () => {
        previousColor.value = currentColor;
      });
    }
  }, [currentStyle, isFocused]);

  return animatedStyle;
};

export default useThemeChangeStyle;
