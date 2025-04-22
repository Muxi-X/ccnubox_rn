import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FC } from 'react';
import { StyleSheet } from 'react-native';

import { useDebounce } from '@/hooks';

import ColorTransitionView from '@/components/view';

import useVisualScheme from '@/store/visualScheme';

import { tabConfig } from '@/constants/tabBar';

import TabBarItem from './TabBarItem';

const TabBar: FC<BottomTabBarProps> = props => {
  const { state, descriptors, navigation } = props;
  const navbarStyle = useVisualScheme(
    state => state.currentStyle?.navbar_background_style
  );
  const handlePress = useDebounce(
    (
      routeKey: string,
      routeName: string,
      routeParams: any,
      focused: boolean
    ) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });

      if (!focused && !event.defaultPrevented) {
        navigation.navigate(routeName, routeParams);
      }
    },
    100
  );

  const handleLongPress = useDebounce((routeKey: string) => {
    navigation.emit({
      type: 'tabLongPress',
      target: routeKey,
    });
  }, 100);
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

        // 使用闭包创建特定路由的处理函数
        const onPress = () => {
          handlePress(route.key, route.name, route.params, isFocused);
        };

        const onLongPress = () => {
          handleLongPress(route.key);
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
