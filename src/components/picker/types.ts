import { ReactElement } from 'react';

import { ModalTriggerProps } from '@/components/modal/types';

export type PickerDataType = { value: string | number; label: string }[][];
export type ConnectorDataType = { content: string; columnIndex: number }[];
export interface DatePickerProps extends Omit<ModalTriggerProps, 'onConfirm'> {
  /** 数据，必须有 label 和 value */
  data?: PickerDataType;
  /** 默认选择的数据 */
  defaultValue?: (string | number)[];
  /** 与 Modal 不同，这里 onConfirm 需要带回选中数据 */
  onConfirm?: (_values: string[]) => void;
  /** 自定义标题展示逻辑 */
  titleDisplayLogic?: (
    _picked: (string | number)[],
    _data: PickerDataType
  ) => string;
  /**
   *  前缀后缀，
   *  例如 2024 09 18 ，填写 prefix 为 ['-', '-']
   *  最终呈现效果为 2024 - 09 - 18
   *  */
  prefixes?: (string | undefined)[];
  /* 元素高度 */
  itemHeight?: number;
  /* 触发弹窗的按钮 */
  children?: ReactElement;
  /** 连接词配置，用于在选择器列之间显示连接词 */
  connectors?: ConnectorDataType;
}

export interface PickerConnectorProps {
  /** 连接词配置数组 */
  connectors: ConnectorDataType;
  /** 选择器总宽度 */
  totalWidth: number;
  /** 选择器单列高度 */
  itemHeight: number;
  /** 选择器数据，用于计算字符长度差异和统计列数 */
  data: PickerDataType;
}
