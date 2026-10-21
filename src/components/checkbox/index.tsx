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
  containerStyle,
}) => {
  // 未选中：透明背景灰色边框空框
  const UncheckedIcon = <View style={styles.boxBase} />;
  // 半选：透明背景灰色边框 + 内部紫色方块
  const IndeterminateIcon = (
    <View style={styles.boxBase}>
      <View style={styles.purpleBlock} />
    </View>
  );
  // 选中：紫色方框 + 白色平缓折线对勾
  const CheckedIcon = (
    <View style={[styles.boxBase, styles.boxChecked]}>
      <View style={styles.checkMark} />
    </View>
  );

  // 半选优先，其次选中/未选中
  const renderIcon = () => {
    if (indeterminate) return IndeterminateIcon;
    return checked ? CheckedIcon : UncheckedIcon;
  };
  const icon = renderIcon();

  return (
    <RneCheckBox
      checked={checked}
      onPress={() => onChange?.(!checked)}
      disabled={disabled}
      // 合并调用方透传的 containerStyle，可覆盖默认间距/布局
      containerStyle={[styles.container, containerStyle]}
      wrapperStyle={styles.wrapper}
      // disabled 时对自定义图标整体降透明度，与正常状态区分
      checkedIcon={
        <View style={disabled ? styles.disabled : undefined}>{icon}</View>
      }
      uncheckedIcon={
        <View style={disabled ? styles.disabled : undefined}>{icon}</View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
  wrapper: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  // disabled 置灰：降低透明度，三种状态统一变淡
  disabled: {
    opacity: 0.5,
  },
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
