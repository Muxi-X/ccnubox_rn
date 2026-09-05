import CheckBox from '@/components/checkbox';
import { ModalTrigger } from '@/components/modal';
import { DatePickerProps, PickerDataType } from '@/components/picker/types';
import useVisualScheme from '@/store/visualScheme';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

/**
 * 位于底部的多选组件, 数据格式保持与 picker 基本一致
 * @param visible 可见与否
 * @param onCancel 点击取消按钮回调
 * @param onConfirm 点击确认回调
 * @param onClose 无论取消或确认，关闭页面回调
 * @param defaultValue 默认选择值
 * @param prefixes 前缀，不动的列
 * @param data 数据
 * @param mode 'bottom' | 'middle' 弹窗位置
 * @param itemHeight 每一行高度
 * @param children 触发 MultiPicker 的元素
 * @param titleDisplayLogic 选择值改变时，如何动态修改title
 * @constructor
 * @example 使用方法
 * // 中框弹窗
 * <MultiPicker onConfirm={res => console.log(res)} mode="middle">
 *   <Text>中框弹窗</Text>
 * </MultiPicker>
 * // 下侧弹窗
 * <MultiPicker itemHeight={60}>
 *   <Text>下侧弹窗</Text>
 * </MultiPicker>
 * // 自定义数据
 * const semesterOptions = [
 *   {
 *     value: '第一学期',
 *     label: '第一学期',
 *   },
 *   {
 *     value: '第二学期',
 *     label: '第二学期',
 *   },
 * ];
 * <MultiPicker data={[semesterOptions]}></MultiPicker>
 */
const MultiPicker: React.FC<DatePickerProps> = ({
  onCancel,
  onConfirm,
  onClose,
  defaultValue,
  mode = 'bottom',
  style,
  data = [],
  children,
  titleDisplayLogic = (multiPickerValue, data) => {
    const pickedLabels = multiPickerValue.map((value, index) => {
      const curArr = data[index];
      const item = curArr.find(item => item.value === value);
      return item?.label;
    });
    return pickedLabels.join('-') + '节';
  },
}) => {
  const [multiPickerValue, setMultiPickerValue] = useState<(string | number)[]>(
    []
  );
  const pickedSet = useMemo(
    () => new Set(multiPickerValue),
    [multiPickerValue]
  );

  const title = useMemo(
    () => titleDisplayLogic(multiPickerValue, data),
    [multiPickerValue, data]
  );

  useEffect(() => {
    handlePick(
      new Set(defaultValue ? defaultValue : data.map(item => item[0].value))
    );
  }, [defaultValue, data]);

  const handlePick = (items: Set<string | number>) => {
    setMultiPickerValue(Array.from(items));
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm(multiPickerValue.map(item => String(item)));
  };

  return (
    <ModalTrigger
      title={title}
      onConfirm={handleConfirm}
      onClose={onClose}
      onCancel={onCancel}
      mode={mode}
      triggerComponent={children}
      style={style}
    >
      <CheckboxGroup
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0)',
        }}
        data={data}
        onPick={handlePick}
        pickedItems={pickedSet}
      />
    </ModalTrigger>
  );
};

export default MultiPicker;

interface CheckboxGroupProps {
  style?: Record<string, any>;
  pickedItems?: Set<string | number>;
  data: PickerDataType;
  onPick?: (item: Set<string | number>) => void;
}

/**
 * 多选框
 * @param onPick 被选中数组变化回调
 * @param data 数据数组 Record<'label' | 'value', string | number>
 * @param pickedItems 选中项 value 数组
 */
export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  onPick,
  data,
  pickedItems,
  ...props
}) => {
  const currentStyle = useVisualScheme(state => state.currentStyle);
  const plainOptions = data[0];
  const [checkedList, setCheckedList] = React.useState(
    pickedItems ?? new Set([])
  );
  const [checkAll, setCheckAll] = React.useState(false);

  React.useEffect(() => {
    const options = plainOptions ?? [];
    const next = pickedItems
      ? new Set<string | number>(pickedItems)
      : new Set<string | number>();
    setCheckedList(next);
    setCheckAll(next.size === options.length);
  }, [pickedItems, plainOptions]);

  const onChange = (value: string | number, isChecked: boolean) => {
    const newCheckedList = new Set(checkedList);
    if (isChecked) {
      newCheckedList.add(value);
    } else {
      newCheckedList.delete(value);
    }
    setCheckedList(newCheckedList);
    setCheckAll(newCheckedList.size === plainOptions.length);
    onPick?.(newCheckedList);
  };

  function createQuickSelect(
    isChecked: boolean,
    selectedValues: Set<string | number>
  ) {
    const checkedItems: Set<string | number> = isChecked
      ? selectedValues
      : new Set();
    setCheckedList(checkedItems);
    onPick?.(checkedItems);
    setCheckAll(checkedItems.size === plainOptions.length);
  }

  const allSet = useMemo(() => {
    return new Set(plainOptions.map(item => item.value));
  }, [plainOptions]);

  const onCheckAllChange = (isChecked: boolean) => {
    createQuickSelect(isChecked, allSet);
  };

  const renderCheckboxItem = (
    label: string,
    checked: boolean,
    onChangeCb: (checked: boolean) => void
  ) => (
    <View style={styles.checkItemWrap}>
      <CheckBox
        label={label}
        checked={checked}
        onChange={onChangeCb}
        labelTextStyle={{
          color: currentStyle?.text_style?.color,
          fontSize: 14,
        }}
        color={
          currentStyle?.classroom_accent_style?.backgroundColor ?? '#7878F8'
        }
        uncheckedColor={currentStyle?.text_style?.color ?? '#cccccc'}
      />
      <View style={styles.itemTransparentLine} />
    </View>
  );

  return (
    <ScrollView
      style={{ height: 200, width: '100%' }}
      automaticallyAdjustContentInsets={false}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.listBody}>
        {renderCheckboxItem('全选', checkAll, onCheckAllChange)}
        <>
          {plainOptions.map(a => (
            <View key={a.value} style={styles.checkItemWrap}>
              <CheckBox
                label={a.label}
                checked={checkedList.has(a.value)}
                onChange={isChecked => onChange(a.value, isChecked)}
                labelTextStyle={{
                  color: currentStyle?.text_style?.color,
                  fontSize: 14,
                }}
                color={
                  currentStyle?.classroom_accent_style?.backgroundColor ??
                  '#7878F8'
                }
                uncheckedColor={currentStyle?.text_style?.color ?? '#cccccc'}
              />
              <View style={styles.itemTransparentLine} />
            </View>
          ))}
        </>
        <View style={styles.bodyBottomTransparentLine} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listBody: {
    borderTopWidth: 2,
    borderColor: '#e0e0e0',
  },
  checkItemWrap: {
    borderRadius: 5,
    margin: 2,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  itemTransparentLine: {
    height: 1,
    width: '60%',
    alignSelf: 'center',
  },
  bodyBottomTransparentLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0)',
  },
});
