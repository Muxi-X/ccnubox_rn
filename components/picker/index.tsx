import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ModalTrigger } from '@/components/modal';
import PickerView from '@/components/picker/pickerView';
import { DatePickerProps } from '@/components/picker/types';

import { commonColors, commonStyles } from '@/styles/common';
import { keyGenerator, percent2px } from '@/utils';

// picker 左侧紫色条宽度
const BORDER_LEFT_WIDTH = 8;
// picker 元素高度
const PICKER_ITEM_HEIGHT = 45;
/* 生成上课时间 */
const geneClassRange = (length: number) => {
  const range = [];
  for (let i = 1; i <= length; i++) {
    range.push({ value: i, label: String(i) });
  }
  return range;
};
export const basicColumns = [
  [
    { label: '周一', value: 'Mon' },
    { label: '周二', value: 'Tues' },
    { label: '周三', value: 'Wed' },
    { label: '周四', value: 'Thur' },
    { label: '周五', value: 'Fri' },
  ],
  geneClassRange(10),
  geneClassRange(10),
];
/**
 * 位于底部的选择器，由于中部选择器与底部选择器存在样式差异，单独列出
 * @param visible 可见与否
 * @param onCancel 点击取消按钮回调
 * @param onConfirm 点击确认回调
 * @param onClose 无论取消或确认，关闭页面回调
 * @param defaultValue 默认选择值
 * @param prefixes 前缀，不动的列
 * @param data 数据
 * @param mode 'bottom' | 'middle' 弹窗位置
 * @param itemHeight 每一行高度
 * @param children 触发 picker 的元素
 * @param titleDisplayLogic 选择值改变时，如何动态修改title
 * @constructor
 * @example 使用方法
 * // 中框弹窗
 * <Picker onConfirm={res => console.log(res)} mode="middle">
 *   <Text>中框弹窗</Text>
 * </Picker>
 * // 下侧弹窗
 * <Picker itemHeight={60}>
 *   <Text>下侧弹窗</Text>
 * </Picker>
 * // 自定义数据
 * <Picker data={basicColumns}></Picker>
 */
const Picker: React.FC<DatePickerProps> = ({
  onCancel,
  onConfirm,
  onClose,
  defaultValue,
  prefixes,
  mode = 'bottom',
  style,
  itemHeight = PICKER_ITEM_HEIGHT,
  data = basicColumns,
  children,
  titleDisplayLogic = (pickerValue, data) => {
    const pickedLabels = pickerValue.map((value, index) => {
      const curArr = data[index];
      const item = curArr.find(item => item.value === value);
      return item?.label;
    });
    return pickedLabels.join('-') + '节';
  },
}) => {
  const [pickerValue, setPickerValue] = useState<(string | number)[]>([]);
  const title = useMemo(
    () => titleDisplayLogic(pickerValue, data),
    [pickerValue, data]
  );
  const isBottomMode = useMemo(() => {
    return mode !== 'middle';
  }, [mode]);
  // 默认选择逻辑
  useEffect(() => {
    handlePick(defaultValue ? defaultValue : data.map(item => item[0].value));
  }, []);
  const handlePick = (pickedValue: (string | number)[]) => {
    setPickerValue(pickedValue);
  };
  const handleConfirm = () => {
    onConfirm && onConfirm(pickerValue.map(item => String(item)));
  };
  const contentWidth = useMemo(() => {
    return percent2px(94) - 60;
  }, []);
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
      <View
        style={[
          styles.content,
          { top: (3 * itemHeight - commonStyles.fontMedium.fontSize) / 2 },
        ]}
      >
        {/* FIX_ME：前缀，目前采用手动计算 */}
        {prefixes &&
          prefixes.map(prefix => (
            <Text
              style={[
                styles.prefix,
                {
                  // 手动计算距离左侧距离
                  left:
                    (contentWidth / prefixes.length +
                      commonStyles.fontMedium.fontSize) /
                    2,
                },
              ]}
              key={keyGenerator.next() as unknown as number}
            >
              {prefix ?? '1'}
            </Text>
          ))}
      </View>
      <PickerView
        data={data}
        numberOfLines={1}
        itemHeight={itemHeight}
        onChange={handlePick}
        value={pickerValue}
        renderMaskBottom={() => {
          return (
            <View
              style={{
                flex: 1,
                borderLeftWidth: BORDER_LEFT_WIDTH,
                borderLeftColor: commonColors.lightGray,
                opacity: 0.6,
                borderRadius: 5,
              }}
            ></View>
          );
        }}
        renderMaskTop={() =>
          isBottomMode ? (
            <View style={styles.maskTop}>
              <LinearGradient
                colors={['#ADA5A600', '#ffffff12']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ flex: 1 }}
              ></LinearGradient>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: commonColors.white,
                opacity: 0.6,
              }}
            ></View>
          )
        }
        styles={isBottomMode ? pickerStyles : {}}
        style={{ height: 3 * itemHeight, width: '100%' }}
        cascade={false}
      />
    </ModalTrigger>
  );
};

export default Picker;

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    alignItems: 'center',
    flex: 1,
    right: 30,
    width: percent2px(94) - 60,
    display: 'flex',
    justifyContent: 'center',
  },
  maskTop: {
    flex: 1,
    borderLeftWidth: BORDER_LEFT_WIDTH,
    borderLeftColor: commonColors.lightGray,
    borderRadius: 5,
    opacity: 0.6,
  },
  prefix: {
    flex: 1,
    fontSize: commonStyles.fontMedium.fontSize,
    textAlign: 'center',
    color: commonColors.darkGray,
  },
});
const pickerStyles = StyleSheet.create({
  maskMiddle: {
    backgroundColor: '#ADA5A612',
    borderLeftWidth: BORDER_LEFT_WIDTH,
    borderColor: commonColors.purple,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  maskTop: {
    flex: 1,
  },
  itemStyle: {
    ...commonStyles.fontMedium,
    color: commonColors.darkGray,
  },
  wrappper: {
    backgroundColor: '#ffffff01',
  },
  itemWrap: {
    backgroundColor: '#ffffff01',
  },
  itemActiveStyle: {
    ...commonStyles.fontMedium,
    fontWeight: 'bold',
    color: commonColors.purple,
  },
});
