import { commonColors } from '@/styles/common';
import { CheckBox as RneCheckBox } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { CheckboxProps } from './type';

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  disabled = false,
  indeterminate = false,
}) => {
  // 未选中：透明背景灰色边框空框
  const UncheckedIcon = <View style={styles.boxBase} />;

  // 半选：透明背景灰色边框 + 内部紫色方块
  const IndeterminateIcon = (
    <View style={styles.boxBase}>
      <View style={styles.purpleBlock} />
    </View>
  );

  // 选中
  const CheckedIcon = (
    <View style={[styles.boxBase, styles.boxChecked]}>
      <View style={styles.checkMark} />
    </View>
  );

  return (
    <RneCheckBox
      checked={checked}
      onPress={() => onChange?.(!checked)}
      disabled={disabled}
      wrapperStyle={{
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        margin: 0,
      }}
      containerStyle={{
        padding: 0,
        margin: 0,
        backgroundColor: 'transparent',
      }}
      checkedIcon={CheckedIcon}
      uncheckedIcon={indeterminate ? IndeterminateIcon : UncheckedIcon}
    />
  );
};

const styles = StyleSheet.create({
  boxBase: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: commonColors.gray,
    borderRadius: 4,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChecked: {
    backgroundColor: commonColors.purple,
    borderColor: commonColors.purple,
  },
  purpleBlock: {
    width: 14,
    height: 14,
    backgroundColor: commonColors.purple,
    borderRadius: 2,
  },

  checkMark: {
    position: 'absolute',
    left: 3,
    top: 5,
    width: 14,
    height: 8,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#fff',
    transform: [{ rotate: '-45deg' }],
  },
});

export default Checkbox;
