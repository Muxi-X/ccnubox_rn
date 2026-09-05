import { CheckBox } from '@rneui/themed';
import { FC, useState } from 'react';

import { CheckboxProps } from './type';

const Checkbox: FC<CheckboxProps> = ({
  checked,
  defaultChecked = false,
  disabled = false,
  label,
  onChange,
  ...rest
}) => {
  const [innerChecked, setInnerChecked] = useState(defaultChecked);

  const isControlled = checked !== undefined;
  const mergedChecked = isControlled ? checked : innerChecked;

  const handlePress = () => {
    if (disabled) return;
    const nextChecked = !mergedChecked;

    if (!isControlled) {
      setInnerChecked(nextChecked);
    }

    onChange?.(nextChecked);
  };

  return (
    <CheckBox
      {...rest}
      title={label ?? undefined}
      checked={mergedChecked}
      disabled={disabled}
      onPress={handlePress}
      containerStyle={{ backgroundColor: 'transparent' }}
    />
  );
};

export default Checkbox;
