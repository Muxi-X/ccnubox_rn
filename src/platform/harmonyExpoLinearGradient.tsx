// @ts-expect-error The Harmony fork declares its API under the upstream module name.
import NativeLinearGradient from '@react-native-ohos/react-native-linear-gradient';
import * as React from 'react';
import { ViewProps } from 'react-native';

type LinearGradientProps = ViewProps & {
  colors: readonly string[];
  end?: { x: number; y: number };
  locations?: readonly number[];
  start?: { x: number; y: number };
};

export function LinearGradient({ ...props }: LinearGradientProps) {
  return <NativeLinearGradient {...props} colors={[...props.colors]} />;
}

export default LinearGradient;
