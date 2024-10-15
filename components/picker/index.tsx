import { PickerView } from '@ant-design/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import BottomModal from '@/components/modal';
import { DatePickerProps } from '@/components/picker/types';
import { commonStyles } from '@/styles/common';
import { keyGenerator } from '@/utils/autoKey';
import { percent2px } from '@/utils/percent2px';

const BORDER_LEFT_WIDTH = 8;
const PICKER_HEIGHT = 200;
/* 生成上课时间 */
const geneClassRange = (length: number) => {
  const range = [];
  for (let i = 1; i <= length; i++) {
    range.push({ value: i, label: String(i) });
  }
  return range;
};
const basicColumns = [
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
const DatePicker: React.FC<DatePickerProps> = ({
  visible = false,
  onCancel,
  onConfirm,
  onClose,
  defaultValue,
  prefixes,
  data = basicColumns,
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
    <BottomModal
      visible={visible}
      title={title}
      onConfirm={handleConfirm}
      onClose={onClose}
      onCancel={onCancel}
    >
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          flex: 1,
          right: 30,
          top: (PICKER_HEIGHT - commonStyles.fontMedium.fontSize) / 2,
          width: contentWidth,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {prefixes &&
          prefixes.map((prefix, index) => (
            <Text
              style={{
                flex: 1,
                fontSize: commonStyles.fontMedium.fontSize,
                textAlign: 'center',
                left:
                  (contentWidth / prefixes.length +
                    commonStyles.fontMedium.fontSize) /
                  2,
                color: '#6D6D75',
              }}
              key={keyGenerator.next() as unknown as number}
            >
              {prefix ?? '1'}
            </Text>
          ))}
      </View>
      <PickerView
        data={data}
        numberOfLines={1}
        itemHeight={80}
        onChange={handlePick}
        value={pickerValue}
        renderMaskTop={() => (
          <View
            style={{
              flex: 1,
              borderLeftWidth: BORDER_LEFT_WIDTH,
              borderLeftColor: '#F6F3F5',
              borderRadius: 5,
            }}
          >
            <LinearGradient
              colors={['#ADA5A600', '#ffffff12']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ flex: 1 }}
            ></LinearGradient>
          </View>
        )}
        styles={{
          maskMiddle: {
            backgroundColor: '#ADA5A612',
            borderLeftWidth: BORDER_LEFT_WIDTH,
            borderColor: '#7878F8',
            borderTopWidth: 0,
            borderBottomWidth: 0,
          },
          maskTop: {
            flex: 1,
          },
          maskBottom: {
            borderLeftWidth: 10,
            borderLeftColor: '#F6F3F5',
            backgroundColor: '#ffffff01',
          },
          itemStyle: {
            ...commonStyles.fontMedium,
            color: '#75757B',
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
            color: '#7878F8',
          },
        }}
        style={{ height: PICKER_HEIGHT }}
        cascade={false}
      />
    </BottomModal>
  );
};

export default memo(DatePicker);
