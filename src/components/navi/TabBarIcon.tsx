import React from 'react';
import { ColorValue, ViewStyle } from 'react-native';

// 导入所有SVG图标
import CalendarIcon from '@/assets/icons/calendar.svg';
import HomeIcon from '@/assets/icons/home.svg';
import LibraryIcon from '@/assets/icons/library.svg';
import NotificationIcon from '@/assets/icons/notification.svg';
import SettingIcon from '@/assets/icons/setting.svg';

export const icons = {
  calendar: CalendarIcon,
  home: HomeIcon,
  library: LibraryIcon,
  notification: NotificationIcon,
  setting: SettingIcon,
};

interface TabBarIconProps {
  style?: ViewStyle;
  name?: keyof typeof icons;
  size?: number;
  color?: ColorValue;
}

export function TabBarIcon({
  style,
  name = 'home',
  size = 24,
  color = 'black',
}: TabBarIconProps) {
  const Icon = icons[name];
  if (!Icon) {
    console.warn(`Icon ${name} not found`);
    return null;
  }

  return <Icon width={size} height={size} color={color} style={style} />;
}
