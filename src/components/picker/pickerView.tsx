import { PickerView as AntdPickerView } from '@ant-design/react-native';
import { PickerViewProps } from '@ant-design/react-native/es/picker-view';
import { PickerViewStyle } from '@ant-design/react-native/es/picker-view/style';
import { FC } from 'react';

import { commonColors } from '@/styles/common';

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

export default PickerView;

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
