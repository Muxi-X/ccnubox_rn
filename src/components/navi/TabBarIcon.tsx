import AntdIcons from '@expo/vector-icons/AntDesign';
import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';

export function TabBarIcon({
  style,
  ...rest
}: IconProps<ComponentProps<typeof AntdIcons>['name']>) {
  return <AntdIcons style={[style]} {...rest} />;
}
