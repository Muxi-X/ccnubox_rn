import { ReactElement } from 'react';

import { ModalTriggerProps } from '@/components/modal/types';

export type PickerDataType = { value: string | number; label: string }[][];
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
}
