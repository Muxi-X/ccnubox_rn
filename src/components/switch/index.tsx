import React, { FC } from 'react';
import { Switch as RNEUIswitch } from '@rneui/themed';
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
    <RNEUIswitch
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
