import AntdIcons from '@expo/vector-icons/AntDesign';
import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';

export function TabBarIcon({
  style,
  name = 'home', // 提供默认图标名称
  ...rest
}: IconProps<ComponentProps<typeof AntdIcons>['name']>) {
  // 确保 name 是有效的
  if (!name) {
    name = 'home';
  }
  return <AntdIcons style={[style]} name={name} {...rest} />;
}
