import { StyleProp, ViewStyle } from 'react-native';
export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}
