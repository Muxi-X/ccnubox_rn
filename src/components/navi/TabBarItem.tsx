import React, { FC, memo, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewProps,
} from "react-native";

import useVisualScheme from "@/store/visualScheme";

import { TABBAR_COLOR } from "@/constants/tabBar";

import AnimatedScale from "../animatedView/AnimatedScale";
import { TabBarIcon } from "./TabBarIcon";
import { TabBarItemProps } from "./types";

const TabBarItem: FC<TabBarItemProps & ViewProps> = (props) => {
  const { isFocused, onPress, onLongPress, label = "", iconName } = props;
  const iconStyle = useVisualScheme(
    (state) => state.currentStyle?.navbar_icon_active_style
  ) as TextStyle;

  const color = useMemo(
    () => (isFocused ? iconStyle?.color : TABBAR_COLOR.PRIMARY),
    [isFocused, iconStyle?.color]
  );

  const IconComponent = useMemo(
    () => (
      <TabBarIcon
        size={24}
        // @ts-ignore
        name={iconName}
        color={color}
        style={styles.icon}
      />
    ),
    [iconName, color]
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
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  icon: {
    display: "flex",
    justifyContent: "center",
  },
  text: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
});
