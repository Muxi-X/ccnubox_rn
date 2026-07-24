import React, { FC } from 'react';
import { Switch as RNEUISwitch } from '@rneui/themed';
import { SwitchProps } from './type';

const Switch: FC<SwitchProps> = ({
  checked,
  onChange,
  style,
  disabled,
  trackColor,
  thumbColor,
}) => {
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
};

export default Switch;
