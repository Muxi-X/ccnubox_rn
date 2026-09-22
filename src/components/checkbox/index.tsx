import { commonColors } from '@/styles/common';
import { Icon } from '@ant-design/react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { CheckboxProps } from './type';

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  indeterminate = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled}>
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? commonColors.purple : commonColors.white,
            borderColor: checked ? commonColors.purple : commonColors.darkGray,
          },
        ]}
      >
        {checked && !indeterminate && (
          <Icon
            name="check"
            size={20}
            color={commonColors.white}
            style={styles.checkIcon}
          />
        )}
        {indeterminate && <View style={styles.partialCheckbox} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontWeight: '600',
  },
  partialCheckbox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: commonColors.purple,
  },
});

export default Checkbox;
