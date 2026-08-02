import { Switch as RNEUISwitch } from '@rneui/themed';
import React, { FC } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { SwitchProps } from './type';

const IOS_SWITCH_WIDTH = 51;
const IOS_SWITCH_HEIGHT = 31;

const Switch: FC<SwitchProps> = ({
  checked = false,
  onChange,
  style,
  disabled,
  trackColor,
  thumbColor,
}) => {
  if (Platform.OS !== 'ios') {
    return (
      <RNEUISwitch
        value={checked}
        onValueChange={onChange}
        style={style}
        disabled={disabled}
        trackColor={trackColor}
        thumbColor={thumbColor}
      />
    );
  }

  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const width =
    typeof flattenedStyle.width === 'number'
      ? flattenedStyle.width
      : IOS_SWITCH_WIDTH;
  const height =
    typeof flattenedStyle.height === 'number'
      ? flattenedStyle.height
      : IOS_SWITCH_HEIGHT;

  return (
    <View
      style={[
        style,
        styles.iosContainer,
        {
          width,
          height,
        },
      ]}
    >
      <RNEUISwitch
        value={checked}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={trackColor}
        thumbColor={thumbColor}
        ios_backgroundColor={trackColor?.false}
        style={{
          transform: [
            { scaleX: width / IOS_SWITCH_WIDTH },
            { scaleY: height / IOS_SWITCH_HEIGHT },
          ],
        }}
      />
    </View>
  );
};

export default Switch;

const styles = StyleSheet.create({
  iosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
