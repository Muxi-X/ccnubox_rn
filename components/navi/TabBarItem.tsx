import { FC } from 'react';
import { Text, ViewProps, Pressable, StyleSheet } from 'react-native';

import { TABBAR_COLOR } from '@/constants/tabBar';

import { TabBarIcon } from './TabBarIcon';
import { TabBarItemProps } from './types';
import AnimatedOpacity from '../animatedView/AnimatedOpacity';
import AnimatedScale from '../animatedView/AnimatedScale';

const TabBarItem: FC<TabBarItemProps & ViewProps> = props => {
  const { isFocused, onPress, onLongPress, label, iconName } = props;
  const color = isFocused ? TABBAR_COLOR.ACTIVE : TABBAR_COLOR.PRIMARY;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <AnimatedScale trigger={isFocused}>
        <TabBarIcon
          size={28}
          // @ts-ignore
          name={iconName}
          color={color}
          className="flex justify-center"
        ></TabBarIcon>
      </AnimatedScale>

      <AnimatedOpacity trigger={isFocused}>
        <Text
          style={{ color: color, marginTop: 2 }}
          className={'flex justify-center text-center'}
        >
          {label}
        </Text>
      </AnimatedOpacity>
    </Pressable>
  );
};

export default TabBarItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
});
