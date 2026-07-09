import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ModalTrigger } from '@/components/modal';
import { PickerConnector, PickerView } from '@/components/picker/pickerView';
import { DatePickerProps } from '@/components/picker/types';

import useVisualScheme from '@/store/visualScheme';

import { commonColors, commonStyles } from '@/styles/common';
import { percent2px } from '@/utils';

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
 * @param connectors 连接词配置，用于在选择器列之间显示连接词
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
 * // 自定义连接词
 * <Picker
 *   connectors={[
 *     { content: '连接', columnIndex: 0 },
 *     { content: '到', columnIndex: 1 }
 *   ]}
 * >
 * </Picker>
 */
const Picker: React.FC<DatePickerProps> = ({
  onCancel,
  onConfirm,
  onClose,
  defaultValue,
  controlledValue,
  onColumnChange,
  prefixes,
  mode = 'bottom',
  style,
  itemHeight = PICKER_ITEM_HEIGHT,
  data = basicColumns,
  children,
  connectors,
  titleDisplayLogic = (pickerValue, data) => {
    const pickedLabels = pickerValue.map((value, index) => {
      const curArr = data[index];
      const item = curArr.find(item => item.value === value);
      return item?.label;
    });
    return pickedLabels.join('-') + '节';
  },
}) => {
  const themeName = useVisualScheme(state => state.themeName);
  const borderLeftColor = useMemo(() => {
    return themeName === 'light'
      ? commonColors.lightGray
      : commonColors.darkGray;
  }, [themeName]);
  const [pickerValue, setPickerValue] = useState<(string | number)[]>([]);
  // 用 ref 追踪上一次值，用于检测哪列发生了变化
  const prevPickerValue = React.useRef<(string | number)[]>([]);

  const title = useMemo(
    () => titleDisplayLogic(pickerValue, data),
    [pickerValue, data]
  );
  const isBottomMode = useMemo(() => {
    return mode !== 'middle';
  }, [mode]);
  // 默认选择逻辑（仅 mount 时）
  useEffect(() => {
    const initial = defaultValue ?? data.map(item => item[0].value);
    prevPickerValue.current = initial;
    setPickerValue(initial);
  }, []);
  // 外部 controlledValue 变化时同步内部状态（用于级联重置）
  useEffect(() => {
    if (!controlledValue) return;
    const serialized = JSON.stringify(controlledValue);
    if (serialized === JSON.stringify(prevPickerValue.current)) return;
    prevPickerValue.current = [...controlledValue];
    setPickerValue([...controlledValue]);
  }, [JSON.stringify(controlledValue)]);

  const handlePick = (pickedValue: (string | number)[]) => {
    const prev = prevPickerValue.current;
    const changedIndex = pickedValue.findIndex((v, i) => v !== prev[i]);
    prevPickerValue.current = [...pickedValue];
    setPickerValue(pickedValue);
    if (onColumnChange && changedIndex >= 0) {
      onColumnChange(pickedValue, changedIndex);
    }
  };
  const handleConfirm = () => {
    if (onConfirm) onConfirm(pickerValue.map(item => String(item)));
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
      {prefixes && (
        <View style={styles.prefixContainer}>
          {prefixes.map((prefix, index) => (
            <Text style={styles.prefix} key={`prefix-${index}`}>
              {prefix ?? ''}
            </Text>
          ))}
        </View>
      )}

      {connectors && connectors.length > 0 && (
        <PickerConnector
          connectors={connectors}
          totalWidth={contentWidth}
          itemHeight={itemHeight}
          data={data}
        />
      )}

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
                borderLeftColor,
                opacity: 0.6,
                borderRadius: 5,
              }}
            ></View>
          );
        }}
        renderMaskTop={() =>
          /** 浅色模式的底部需要渐变 */
          isBottomMode && themeName === 'light' ? (
            <View style={{ ...styles.maskTop, borderLeftColor }}>
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
                backgroundColor:
                  themeName === 'light'
                    ? commonColors.white
                    : commonColors.black,
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
  prefixContainer: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
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
