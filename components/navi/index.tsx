import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import ColorTransitionView from '@/components/view';

import { tabConfig } from '@/constants/tabBar';
import useVisualScheme from '@/store/visualScheme';

import TabBarItem from './TabBarItem';

const TabBar: FC<BottomTabBarProps> = props => {
  const { state, descriptors, navigation } = props;
  const navbarStyle = useVisualScheme(
    state => state.currentStyle?.navbar_background_style
  );
  return (
    <ColorTransitionView
      configurableThemeName="navbar_background_style"
      style={[styles.tabbar, navbarStyle]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const iconName = tabConfig[index]?.iconName;
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state?.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
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
      })}
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
