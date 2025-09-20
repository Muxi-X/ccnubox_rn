import { PickerView as AntdPickerView } from '@ant-design/react-native';
import { PickerViewProps } from '@ant-design/react-native/es/picker-view';
import { PickerViewStyle } from '@ant-design/react-native/es/picker-view/style';
import { FC } from 'react';
import { DimensionValue, StyleSheet, Text, View } from 'react-native';

import { PickerConnectorProps } from '@/components/picker/types';

import { commonColors, commonStyles } from '@/styles/common';

const PickerView: FC<PickerViewProps> = ({ styles: propStyles, ...props }) => {
  return (
    <>
      <AntdPickerView
        styles={{ ...styles, ...propStyles }}
        {...props}
      ></AntdPickerView>
    </>
  );
};

/**
 * 选择器连接词组件,用于在选择器列之间显示连接词
 */
const PickerConnector: FC<PickerConnectorProps> = ({
  connectors,
  totalWidth,
  itemHeight,
  data,
}) => {
  const columnCount = data.length;

  // 计算实际渲染宽度差异(字母比汉字大概小0.4)
  const getTextWidth = (text: string): number => {
    const chineseCharRegex = /[\u4e00-\u9fa5]/g;
    const chineseCount = (text.match(chineseCharRegex) || []).length;
    const otherCount = text.length - chineseCount;
    return (
      chineseCount * commonStyles.fontMedium.fontSize +
      otherCount * commonStyles.fontMedium.fontSize * 0.6
    );
  };

  // 计算字符长度差异的偏差值
  const calcLengthDeviation = (columnIndex: number): number => {
    if (
      !data[columnIndex] ||
      !data[columnIndex + 1] ||
      !data[columnIndex][0] ||
      !data[columnIndex + 1][0]
    ) {
      return 0;
    }

    const leftPickerLabel = data[columnIndex][0].label;
    const rightPickerLabel = data[columnIndex + 1][0].label;

    const leftWidth = getTextWidth(leftPickerLabel);
    const rightWidth = getTextWidth(rightPickerLabel);

    return (leftWidth - rightWidth) / 2;
  };

  // 验证索引范围，目前只支持放在选择器之间，后续需要可扩展
  const checkColumnIndex = (columnIndex: number): boolean => {
    return columnIndex >= 0 && columnIndex < columnCount - 1;
  };

  // 计算连接词位置和宽度
  const calcConnectorLayout = (columnIndex: number) => {
    // 验证列索引范围
    if (!checkColumnIndex(columnIndex)) {
      throw new Error('columnIndex is out of range');
    }

    // 计算每列的宽度
    const columnWidth = totalWidth / columnCount;

    // 连接词位置为当前列向后移动一半
    const ConnectorX = (columnIndex + 0.5) * columnWidth;

    // 计算字符长度差异的偏差值
    const deviation = calcLengthDeviation(columnIndex);

    // 计算最后布局
    const left: DimensionValue = `${(ConnectorX / totalWidth) * 100}%`;
    const width: DimensionValue = `${((columnWidth + deviation) / totalWidth) * 100}%`;

    return {
      left,
      width,
    };
  };

  return (
    <View
      style={{
        ...connectorStyles.mask,
        height: itemHeight,
      }}
      pointerEvents="none"
    >
      {connectors.map((connector, index) => {
        const layout = calcConnectorLayout(connector.columnIndex);

        return (
          <Text
            key={index}
            style={{
              ...connectorStyles.content,
              left: layout.left,
              width: layout.width,
            }}
          >
            {connector.content}
          </Text>
        );
      })}
    </View>
  );
};

export { PickerConnector, PickerView };

const styles: Partial<PickerViewStyle> = {
  maskMiddle: {
    borderRadius: 10,
    backgroundColor: commonColors.gray,
    opacity: 0.2,
    zIndex: -1,
  },
  itemActiveStyle: {
    color: commonColors.black,
  },
};

const connectorStyles = StyleSheet.create({
  mask: {
    position: 'absolute',
    width: '100%',
  },
  content: {
    position: 'absolute',
    top: '43%',
    textAlign: 'center',
    fontSize: commonStyles.fontMedium.fontSize,
    color: commonColors.darkGray,
    transform: [{ translateY: -commonStyles.fontMedium.fontSize / 2 }],
  },
});
