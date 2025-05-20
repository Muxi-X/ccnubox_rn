import { Checkbox, List, ListProps } from '@ant-design/react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { ModalTrigger } from '@/components/modal';
import { DatePickerProps, PickerDataType } from '@/components/picker/types';

import useVisualScheme from '@/store/visualScheme';

const CheckboxItem = Checkbox.CheckboxItem;

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
  const title = useMemo(
    () => titleDisplayLogic(multiPickerValue, data),
    [multiPickerValue, data]
  );
  // 默认选择逻辑
  useEffect(() => {
    handlePick(
      new Set(defaultValue ? defaultValue : data.map(item => item[0].value))
    );
  }, []);
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
        pickedItems={new Set(multiPickerValue)}
      />
    </ModalTrigger>
  );
};

export default MultiPicker;

interface CheckboxGroupProps extends ListProps {
  pickedItems?: Set<string | number>;
  data: PickerDataType;
  onPick?: (item: Set<string | number>) => void;
}
/**
 * 多选框
 * @param onPick 被选中数组变化回调
 * @param data 数据数组 Record<'label' | 'value', string | number>
 * @param pickedItems 选中项 value 数组
 * @argument 其余参数参考 ListProps
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
  const [indeterminate, setIndeterminate] = React.useState(true);
  const [checkAll, setCheckAll] = React.useState(false);

  const onChange = (
    value: string | number,
    e: { target: { checked: boolean } }
  ) => {
    if (e.target.checked) {
      checkedList.add(value);
    } else {
      checkedList.delete(value);
    }
    onPick?.(checkedList);

    setCheckedList(new Set(checkedList));
    setIndeterminate(
      !!checkedList.size && checkedList.size < plainOptions.length
    );
    setCheckAll(checkedList.size === plainOptions.length);
  };

  const onCheckAllChange = (e: { target: { checked: boolean } }) => {
    const checkedItems: Set<string | number> = e.target.checked
      ? new Set(plainOptions.map(item => item.value))
      : new Set();
    setCheckedList(checkedItems);
    onPick?.(checkedItems);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  return (
    <ScrollView
      style={{ height: 200, width: '100%' }}
      automaticallyAdjustContentInsets={false}
      showsHorizontalScrollIndicator={false}
    >
      <List
        {...props}
        styles={{
          Body: {
            borderColor: '#e0e0e0',
            borderTopWidth: 2,
          },
          BodyBottomLine: {
            backgroundColor: 'rgba(0, 0, 0, 0)',
          },
        }}
      >
        <CheckboxItem
          indeterminate={indeterminate}
          onChange={onCheckAllChange}
          checked={checkAll}
          styles={{
            Item: {
              borderRadius: 5,
              margin: 2,
              backgroundColor: 'rgba(0,0,0,0)',
            },
            Line: {
              borderColor: 'rgba(0, 0, 0, 0)',
            },
          }}
        >
          <Text
            style={{
              color: currentStyle?.text_style?.color,
              fontSize: 14,
            }}
          >
            全选
          </Text>
        </CheckboxItem>
        <>
          {plainOptions.map(a => (
            <CheckboxItem
              key={a.value}
              onChange={onChange.bind(this, a.value)}
              checked={checkedList.has(a.value)}
              styles={{
                Item: {
                  borderRadius: 5,
                  margin: 2,
                  backgroundColor: 'rgba(0,0,0,0)',
                },
                Line: {
                  borderColor: 'rgba(0, 0, 0, 0)',
                },
              }}
            >
              <Text
                style={{
                  color: currentStyle?.text_style?.color,
                  fontSize: 14,
                }}
              >
                {a.label}
              </Text>
            </CheckboxItem>
          ))}
        </>
      </List>
    </ScrollView>
  );
};
