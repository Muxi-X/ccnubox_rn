import * as React from 'react';
import { View, ViewProps } from 'react-native';

type LinearGradientProps = ViewProps & {
  colors: readonly string[];
  end?: { x: number; y: number };
  locations?: readonly number[];
  start?: { x: number; y: number };
};

export function LinearGradient({
  colors,
  style,
  children,
  ...props
}: LinearGradientProps) {
  return (
    <View
      {...props}
      style={[style, { backgroundColor: colors[0] ?? 'transparent' }]}
    >
      {children}
    </View>
  );
}

export default LinearGradient;
