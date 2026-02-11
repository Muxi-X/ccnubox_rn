import { useEvents } from '@/store/events';
import useVisualScheme from '@/store/visualScheme';
import { type FC, memo, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewProps,
} from 'react-native';

import { TABBAR_COLOR } from '@/constants/tabBar';

import AnimatedScale from '../animatedView/AnimatedScale';
import { TabBarIcon } from './TabBarIcon';
import type { TabBarItemProps } from './types';

const TabBarItem: FC<TabBarItemProps & ViewProps> = props => {
  const { isFocused, onPress, onLongPress, label = '', iconName, name } = props;
  const iconStyle = useVisualScheme(
    state => state.currentStyle?.navbar_icon_active_text_style
  ) as TextStyle;

  const feedEvents = useEvents(state => state.feedEvents);
  const unreadCount = useMemo(() => {
    if (name !== 'notification') return 0;
    return feedEvents.filter(e => !e.read).length;
  }, [name, feedEvents]);

  const color = useMemo(
    () => (isFocused ? iconStyle?.color : TABBAR_COLOR.PRIMARY),
    [isFocused, iconStyle?.color]
  );

  const IconComponent = useMemo(
    () => (
      <View style={styles.iconWrapper}>
        <TabBarIcon
          size={24}
          name={iconName}
          color={color}
          style={styles.icon}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    ),
    [iconName, color, unreadCount]
  );

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.container]}
    >
      <AnimatedScale trigger={isFocused}>{IconComponent}</AnimatedScale>
      <Text style={[{ color: color }, styles.text]}>{label}</Text>
    </Pressable>
  );
};

export default memo<TabBarItemProps & ViewProps>(TabBarItem);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  iconWrapper: {
    position: 'relative',
  },
  icon: {
    display: 'flex',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  text: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
});
