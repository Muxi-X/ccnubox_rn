import * as React from 'react';
import { TextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { useThemeChangeStyle } from '@/hooks';

import { ConfigurableThemeNames } from '@/styles/types';

/**
 * 可以根据颜色设置更改的 Text 组件
 * @param style
 * @param configurableThemeName
 * @param restProps
 * @constructor
 */
const ThemeBasedText: React.FC<
  { configurableThemeName?: ConfigurableThemeNames } & TextProps
> = ({ style, configurableThemeName = 'text_style', ...restProps }) => {
  const animatedStyle = useThemeChangeStyle(configurableThemeName, 'color');

  return <Animated.Text style={[style, animatedStyle]} {...restProps} />;
};

export default ThemeBasedText;
