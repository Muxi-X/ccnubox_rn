import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { FC, useCallback } from 'react';
import { StyleSheet } from 'react-native';

import useDebounce from '@/hooks/useDebounce';

import ColorTransitionView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { tabConfig } from '@/constants/tabBar';

import TabBarItem from './TabBarItem';

const TabBar: FC<BottomTabBarProps> = props => {
  const { state, descriptors, navigation } = props;
  const navbarStyle = useVisualScheme(
    state => state.currentStyle?.navbar_background_style
  );

  const handlePress = useCallback(
    (route: any, isFocused: boolean) => {
      if (!route) return;

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation]
  );

  // Reduce debounce time for more responsive tab switching while still preventing double-taps
  const debouncedHandler = useDebounce(handlePress, 100);
  // Memoize tab items to prevent unnecessary re-renders
  const tabItems = React.useMemo(() => {
    return state.routes.map((route, index) => {
      if (!route || !route.key || !descriptors || !descriptors[route.key]) {
        return null;
      }

      const { options } = descriptors[route.key];
      const iconName = tabConfig[index]?.iconName;
      const label =
        options?.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options?.title !== undefined
            ? options.title
            : null;

      const isFocused = state?.index === index;
      const onPress = () => debouncedHandler(route, isFocused);

      const onLongPress = () => {
        navigation.emit({
          type: 'tabLongPress',
          target: route.name,
        });
      };

      return (
        <TabBarItem
          key={route.name}
          onPress={onPress}
          onLongPress={onLongPress}
          isFocused={isFocused}
          name={route.name}
          iconName={iconName}
          label={label as string}
        />
      );
    });
  }, [state.routes, state.index, descriptors, debouncedHandler]);

  return (
    <ColorTransitionView
      configurableThemeName="navbar_background_style"
      style={[styles.tabbar, navbarStyle]}
    >
      {tabItems}
    </ColorTransitionView>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    bottom: 0,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderCurve: 'continuous',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
});
