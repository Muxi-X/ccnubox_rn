import type { CheckBoxProps as RneRawCheckBoxProps } from '@rneui/base';

// 获取RNE原生title类型
type RneTitle = RneRawCheckBoxProps['title'];

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: RneTitle | null;
  onChange?: (checked: boolean) => void;
  [restProp: string]: unknown;
}
