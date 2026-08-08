import React from 'react';
import { ColorValue, ViewStyle } from 'react-native';

import {
  type TabBarIconName,
  tabBarIcons,
  tabBarSelectedIcons,
} from '@/assets/icons';

export const icons = tabBarIcons;

interface TabBarIconProps {
  style?: ViewStyle;
  name?: TabBarIconName;
  size?: number;
  color?: ColorValue;
  focused?: boolean;
}

export function TabBarIcon({
  style,
  name = 'home',
  size = 24,
  color = 'black',
  focused = false,
}: TabBarIconProps) {
  const Icon = focused ? tabBarSelectedIcons[name] : tabBarIcons[name];
  if (!Icon) {
    // eslint-disable-next-line no-console
    console.warn(`Icon ${name} not found`);
    return null;
  }

  return <Icon width={size} height={size} color={color} style={style} />;
}
