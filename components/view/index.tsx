import * as React from 'react';
import { ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { useThemeChangeStyle } from '@/hooks';

import { ConfigurableThemeNames } from '@/styles/types';

/**
 * 可以根据背景色切换颜色的 View 组件
 * @param style
 * @param configurableThemeName
 * @param restProps
 * @constructor
 */
const View: React.FC<
  { configurableThemeName?: ConfigurableThemeNames } & ViewProps
> = ({ style, configurableThemeName = 'background_style', ...restProps }) => {
  const animatedStyle = useThemeChangeStyle(
    configurableThemeName,
    'backgroundColor'
  );

  return <Animated.View style={[style, animatedStyle]} {...restProps} />;
};

export default View;
