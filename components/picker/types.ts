import { BottomModalProps } from '@/components/modal/types';

type PickerDataType = { value: string | number; label: string }[][];
export interface DatePickerProps extends Omit<BottomModalProps, 'onConfirm'> {
  /* 数据，必须有 label 和 value */
  data?: PickerDataType;
  /* 默认选择的数据 */
  defaultValue?: (string | number)[];
  /* 与 Modal 不同，这里 onConfirm 需要带回选中数据 */
  onConfirm?: (values: string[]) => void;
  /* 自定义标题展示逻辑 */
  titleDisplayLogic?: (
    picked: (string | number)[],
    data: PickerDataType
  ) => string;
}
